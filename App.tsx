import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, TextInput, Button, Dimensions } from 'react-native';
import { Title } from 'react-native-paper';
import React , {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import * as SecureStore from 'expo-secure-store';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { SwipeListView } from  'react-native-swipe-list-view';
const Stack = createNativeStackNavigator();
const screenHeight = Dimensions.get('window').height;

async function save(key, values) {
    let itemsStore = JSON.stringify(values);
  await SecureStore.setItemAsync(key, itemsStore);
}

async function deleteAllItems() {
  await SecureStore.setItemAsync('items', '[]');
}

async function deleteItem( idx, status) {
    let result = await SecureStore.getItemAsync('items');
    res = JSON.parse(result);
    let resNoCompleted = res.filter(i => !i.completed);
    let resCompleted = res.filter(i => i.completed);
    if( status == 'toDo' ) {
        resNoCompleted.splice( idx, 1 )
    } else {
        resCompleted.splice( idx, 1 )
    }

   let newValue = JSON.stringify([...resCompleted, ...resNoCompleted]);
   await SecureStore.setItemAsync('items', newValue);
}

async function finishItem( idx ) {
    let result = await SecureStore.getItemAsync('items');
    res = JSON.parse(result);
    let resNoCompleted = res.filter(i => !i.completed);
    let resCompleted = res.filter(i => i.completed);

    resNoCompleted[idx].completed = true;
   let newValue = JSON.stringify([...resCompleted, ...resNoCompleted]);
   await SecureStore.setItemAsync('items', newValue);
}

async function notFinishItem( idx ) {
    let result = await SecureStore.getItemAsync('items');
    let res = JSON.parse(result);
    let resCompleted = res.filter(i => i.completed);
    let resNoCompleted = res.filter(i => !i.completed);
    resCompleted[idx].completed = false;


   let newValue = JSON.stringify([...resCompleted, ...resNoCompleted]);
   await SecureStore.setItemAsync('items', newValue);
}

function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
    </View>
  );
}

async function saveItem(value) {
      let result = await SecureStore.getItemAsync('items');
      res = JSON.parse(result);
      res.push({task: value, completed: false});
      let newValue = JSON.stringify(res);
      await SecureStore.setItemAsync('items', newValue);
}

function TaskPage({ navigation }) {
  const [itemsKeys, onChangeKey] = useState('items');
  const [itemsValues, onChangeItem] = useState( [] );

  async function getValueFor( key ) {
   let result = await SecureStore.getItemAsync(key);
   res = JSON.parse(result);
   if (result) return res;
   else alert('invalid')
  }


  async function fetchData() {
    const itemsCollection = await getValueFor(itemsKeys);
    if (itemsCollection) {
      onChangeItem(itemsCollection);
    }
  }

  useEffect(() => {
    fetchData();
  }, [itemsKeys]);

  const focusFunction = async () => { fetchData(); };
  useEffect(() => {
     navigation.addListener('focus', focusFunction);
        return () => {
          navigation.removeListener('focus', focusFunction);
        };
  }, []);

  let aFaire = itemsValues.length > 0 ? itemsValues.filter(i => !i.completed).map( i => <View style={styles.taskContainer}><Text style={{fontSize: 25}}>{i.task}</Text></View> ) : [];
  let nonTermines = itemsValues.length > 0 ? itemsValues.filter(i => i.completed).map( i => <View style={styles.taskContainer}><Text style={{fontSize: 25}}>{i.task}</Text></View> ) : [];

    renderItem = rowData => (
          <TouchableOpacity
              onPress={() => console.log('Item touched')}
              style={styles.itemContainer}>
              <View style={{backgroundColor: 'white'}}>
                <Text>{rowData.item}</Text>
                </View>
          </TouchableOpacity>
      );

   renderHiddenItem = (rowData, rowMap, params) => {
   let styleAction = params == 'toDo' ? styles.finishButton : styles.notFinishButton;
   let action = params == 'toDo' ? finishItem : notFinishItem;
   let actionTxt = params == 'toDo' ? 'Terminer' : 'Non Terminé';
    return (
                         <View style={styles.hiddenContainer}>
                             <TouchableOpacity
                                 style={[styles.hiddenButton, styleAction ]}
                                 onPress={() => {
                                    action( rowData.index ).then(()=> {
                                        fetchData();
                                    });
                                 }
                                 }

                             >
                                 <Text style={styles.buttonText}>{actionTxt}</Text>
                             </TouchableOpacity>
                             <TouchableOpacity
                                 style={[styles.hiddenButton, styles.deleteButton]}
                                 onPress={() => {
                                    deleteItem( rowData.item.key, params ).then(()=> {
                                        fetchData();
                                    });
                                 }

                                 }
                             >
                                 <Text style={styles.buttonText}>X</Text>
                             </TouchableOpacity>
                         </View>
              );
   }

    onRowOpen = rowKey => {
        console.log('Opened row with key:', rowKey);
    };
    return (
        <View style={ {backgroundColor: '#F3F3F3' }}>
              <View style={styles.bodyContainer}>
                <ScrollView>
                <View style={{ flex:1,  flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 10, marginBottom: 20}}>
                    <View style={{ backgroundColor: '#76D0FC', alignSelf: 'flex-start', marginRight: 20 }}>
                        <Button title="Nouveau" color="white" onPress={() => {
                        console.log('click');
                        navigation.navigate('Create')
                        }
                        }/>
                    </View>
                    <View style={{ backgroundColor: '#FF6060', alignSelf: 'flex-start' }}>
                          <Button title="Supprimer" color="white" onPress={() => {
                                deleteAllItems().then(() => {
                                    fetchData();
                                });
                                }
                          } />
                     </View>
                </View>
                </ScrollView>
              </View>
              <View style={{ marginLeft: 10, marginRight: 10, height: '80%'}}>
                                  <View>
                                      <Text style={{fontSize: 20, fontWeight: 'bold', fontSize: 30}} >A faire</Text>
                                      <View>
                                              <SwipeListView
                                                        style={{ maxHeight: screenHeight * 0.4 }}
                                                          data={aFaire}
                                                          renderItem={(data) => this.renderItem(data, 'toDo')}
                                                          renderHiddenItem={(data) => this.renderHiddenItem(data, null, 'toDo')}
                                                          rightOpenValue={-150}
                                                      />
                                      </View>
                                  </View>
                                  <View style={{marginTop: 30}}>
                                       <Text style={{fontSize: 20, fontWeight: 'bold', fontSize:30}} >Terminée</Text>
                                       <View>
                                          <SwipeListView
                                          style={{ maxHeight: screenHeight * 0.4 }}
                                            data={nonTermines}
                                            renderItem={(data) => this.renderItem(data, 'finish')}
                                            renderHiddenItem={(data) => this.renderHiddenItem(data, null, 'finish')}
                                            rightOpenValue={-150}
                                          />
                                       </View>
                                  </View>
                              </View>
            </View>
    )
}
//saveItem(value);
function CreateScreen({navigation}) {
  const [value, onChangeValue] = useState('');

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'start',  marginTop: 20}}>
      <TextInput style={styles.input}  placeholder="Nouvelle tâche"  onChangeText={ text => onChangeValue(text)} />
        <View style={{ backgroundColor: '#76D0FC', borderColor: '#CFCFCF', alignSelf: 'center', marginRight: 20 }}>
           <Button title="Valider" color="white" onPress={() =>{
                saveItem(value).then(() => {
                    navigation.navigate('To Do List')
                });
            }
            }/>
        </View>
    </View>
  );
}

export default function App() {
  return (
      <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="To Do List" component={TaskPage} />
                 <Stack.Screen name="Create" component={CreateScreen} />
          </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
 input: {
          height: 40,
          margin: 12,
          width: '80%',
          borderWidth: 1,
          borderColor: '#CFCFCF',
          padding: 10,
          backgroundColor: 'white'

        },
  titleConteiner: {
    borderBottomColor: '#D5D5D5',
    borderBottomWidth: 1,
    flex: 1,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: 'white'
  },
  baseText: {
      fontFamily: 'Cochin',
   },
  titleText: {
    flex: 1,
    padding: 10,
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 50,
    marginLeft: 20,
    alignSelf: 'flex-start'
  },
  taskContainer: {
    padding: 20,
    backgroundColor: '#E3E3E3²',
    borderColor: '#CFCFCF',
    borderWidth: 0
  },

   container: {
          flex: 1,
          backgroundColor: '#eee', // Light Gray
          paddingVertical: 20,
          paddingHorizontal: 15,
      },
      heading: {
          fontSize: 30,
          fontWeight: 'bold',
          marginBottom: 20,
          color: 'green',
          margin: 20,
          textAlign: 'center',
      },
      subheading: {
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 20,
          color: '#333', // Dark Gray
          margin: 10,
          textAlign: 'center',
      },
      itemContainer: {
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFF',
          height: 80,
          borderRadius: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 3,
          elevation: 3,
          marginBottom: 10,
      },

      hiddenContainer: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          backgroundColor: '#FFF',
          height: 80,
          borderRadius: 20,
      },
      hiddenButton: {
          justifyContent: 'center',
          alignItems: 'center',
          width: 75,
          height: 80,
      },
      finishButton: {
          backgroundColor: '#7DC961',
          borderRadius: 2,
      },
      notFinishButton: {
        backgroundColor: '#9C9C9C',
        borderRadius: 2
      },
      deleteButton: {
          borderBottomRightRadius: 8,
          borderTopRightRadius: 8,
          backgroundColor: '#ED6666',
      },
      buttonText: {
          color: '#FFF',
          fontSize: 16,
          fontWeight: 'bold',
      }
});