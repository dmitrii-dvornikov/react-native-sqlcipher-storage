/*
 * sqlite.ios.promise.js
 *
 * Created by Andrzej Porebski on 10/29/15.
 * Copyright (c) 2015 Andrzej Porebski.
 *
 * Test App using Promise for react-naive-sqlite-storage
 *
 * This library is available under the terms of the MIT License (2008).
 * See http://opensource.org/licenses/alphabetical for full text.
 */
'use strict';

import SQLite from 'react-native-sqlcipher-storage';
import XBar from 'react-native-x-bar'
SQLite.DEBUG(true);
SQLite.enablePromise(true);

import React from 'react';
import  {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  SafeAreaView
} from 'react-native';


type Database = Object;
var database_name = "Test.db";
var database_key = "password";
var bad_database_key = "bad";
var db: Database;
var goodPassword = true;

class App extends React.Component {

  state : {progress: string[]} = {
    progress: []
  }

  componentWillUnmount() {
    this.closeDatabase();
  }

  errorCB = (err: string) => {
    console.log("error: ",err);
    const { progress } = this.state
    progress.push(`Error : ${err}`);
    this.setState({progress});
  }

  populateDatabase = (db: Database) => {
        const { progress } = this.state;
        progress.push("Database integrity check");
        this.setState({progress});
        db.executeSql('SELECT 1 FROM Version LIMIT 1').then(() =>{
            progress.push("Database is ready ... executing query ...");
            this.setState({progress});
            db.transaction(this.queryEmployees).then(() => {
                progress.push("Processing completed");
                this.setState({progress});
            });
        }).catch((error) =>{
            console.log("Received error: ", error)
            progress.push("Database not yet ready ... populating data");
            this.setState({progress});
            db.transaction(this.populateDB).then(() =>{
                progress.push("Database populated ... executing query ...");
                this.setState({progress});
                db.transaction(this.queryEmployees).then((result) => {
                    console.log("Transaction is now finished");
                    progress.push("Processing completed");
                    this.setState({progress});
                    this.closeDatabase()});
            });
        });
    }

    populateDB = (tx) => {
        const {progress} = this.state;

        progress.push("Executing DROP stmts");
        this.setState(progress);

        tx.executeSql('DROP TABLE IF EXISTS Employees;');
        tx.executeSql('DROP TABLE IF EXISTS Offices;');
        tx.executeSql('DROP TABLE IF EXISTS Departments;');

        this.state.progress.push("Executing CREATE stmts");
        this.setState(this.state);

        tx.executeSql('CREATE TABLE IF NOT EXISTS Version( '
            + 'version_id INTEGER PRIMARY KEY NOT NULL); ').catch((error: Error) => {
            this.errorCB(error.message);
        });

        tx.executeSql('CREATE TABLE IF NOT EXISTS Departments( '
            + 'department_id INTEGER PRIMARY KEY NOT NULL, '
            + 'name VARCHAR(30) ); ').catch((error: Error) => {
            this.errorCB(error.message)
        });

        tx.executeSql('CREATE TABLE IF NOT EXISTS Offices( '
            + 'office_id INTEGER PRIMARY KEY NOT NULL, '
            + 'name VARCHAR(20), '
            + 'longtitude FLOAT, '
            + 'latitude FLOAT ) ; ').catch((error: Error) => {
            this.errorCB(error.message)
        });

        tx.executeSql('CREATE TABLE IF NOT EXISTS Employees( '
            + 'employe_id INTEGER PRIMARY KEY NOT NULL, '
            + 'name VARCHAR(55), '
            + 'office INTEGER, '
            + 'department INTEGER, '
            + 'FOREIGN KEY ( office ) REFERENCES Offices ( office_id ) '
            + 'FOREIGN KEY ( department ) REFERENCES Departments ( department_id ));').catch((error: Error) => {
            this.errorCB(error.message)
        });

        progress.push("Executing INSERT stmts");
        this.setState({progress});


        tx.executeSql('INSERT INTO Departments (name) VALUES ("Client Services");');
        tx.executeSql('INSERT INTO Departments (name) VALUES ("Investor Services");');
        tx.executeSql('INSERT INTO Departments (name) VALUES ("Shipping");');
        tx.executeSql('INSERT INTO Departments (name) VALUES ("Direct Sales");');

        tx.executeSql('INSERT INTO Offices (name, longtitude, latitude) VALUES ("Denver", 59.8,  34.1);');
        tx.executeSql('INSERT INTO Offices (name, longtitude, latitude) VALUES ("Warsaw", 15.7, 54.1);');
        tx.executeSql('INSERT INTO Offices (name, longtitude, latitude) VALUES ("Berlin", 35.3, 12.1);');
        tx.executeSql('INSERT INTO Offices (name, longtitude, latitude) VALUES ("Paris", 10.7, 14.1);');

        tx.executeSql('INSERT INTO Employees (name, office, department) VALUES (?,?,?);', ["Sylvester Stallone", 2, 4]);
        tx.executeSql('INSERT INTO Employees (name, office, department) VALUES (?,?,?);', ["Elvis Presley", 2, 4]);
        tx.executeSql('INSERT INTO Employees (name, office, department) VALUES ("Leslie Nelson", 3,  4);');
        tx.executeSql('INSERT INTO Employees (name, office, department) VALUES ("Fidel Castro", 3, 3);');
        tx.executeSql('INSERT INTO Employees (name, office, department) VALUES ("Bill Clinton", 1, 3);');
        tx.executeSql('INSERT INTO Employees (name, office, department) VALUES ("Margaret thischer", 1, 3);');
        tx.executeSql('INSERT INTO Employees (name, office, department) VALUES ("Donald Trump", 1, 3);');
        tx.executeSql('INSERT INTO Employees (name, office, department) VALUES ("Dr DRE", 2, 2);');
        tx.executeSql('INSERT INTO Employees (name, office, department) VALUES ("Samantha Fox", 2, 1);');
        console.log("all config SQL done");
    };

    queryEmployees = (tx) => {
        console.log("Executing employee query");
        tx.executeSql('SELECT a.name, b.name as deptName FROM Employees a, Departments b WHERE a.department = b.department_id').then(([tx,results]) => {
            this.state.progress.push("Query completed");
            this.setState(this.state);
            var len = results.rows.length;
            for (let i = 0; i < len; i++) {
                let row = results.rows.item(i);
                this.state.progress.push(`Empl Name: ${row.name}, Dept Name: ${row.deptName}`);
            }
            this.setState(this.state);
        }).catch((error: Error) => {
            console.log(error);
        });
    };

    loadAndQueryDB = () => {
        this.state.progress.push("Opening database ...");
		this.state.progress.push(goodPassword ? "Good Password" : "Bad Password");
        this.setState(this.state);
        SQLite.openDatabase({'name': database_name, 'key': goodPassword ? database_key : bad_database_key}).then((DB) => {
            db = DB;
            this.state.progress.push("Database OPEN");
            this.setState(this.state);
            this.populateDatabase(DB);
        }).catch((error: Error) => {
            console.log(error);
        });
    };

    closeDatabase = () => {
        if (db) {
            console.log("Closing database ...");
			goodPassword = !goodPassword;
            this.state.progress.push("Closing DB");
            this.setState(this.state);
            db.close().then((status) => {
                this.state.progress.push("Database CLOSED");
                this.setState(this.state);
            }).catch((error: Error) => {
                this.errorCB(error.message);
            });
        } else {
            this.state.progress.push("Database was not OPENED");
            this.setState(this.state);
        }
    };

    deleteDatabase = () => {
        this.state.progress = ["Deleting database"];
        this.setState(this.state);
		goodPassword = true;
        SQLite.deleteDatabase(database_name).then(() => {
            console.log("Database DELETED");
            this.state.progress.push("Database DELETED");
            this.setState(this.state);
        }).catch((error: Error) => {
            this.errorCB(error.message);
        });
    };

    runDemo = () => {
        this.state.progress = ["Starting SQLite Demo"];
        this.setState(this.state);
        this.loadAndQueryDB();
    };

    renderProgressEntry = ({item}: {item: string})=> {
        return (<View style={listStyles.li}>
            <View>
                <Text style={listStyles.liText}>{item}</Text>
            </View>
        </View>)
    };

    render(){
        return (<SafeAreaView style={styles.mainContainer}>
            <View>
                <Button title="Run tests" onPress = {this.runDemo}/>
                <Button title="Close DB" onPress = {this.closeDatabase}/>
                <Button title="Delete DB" onPress = {this.deleteDatabase}/>
            </View>
            <FlatList
                data={this.state.progress}
                renderItem={this.renderProgressEntry}
                style={listStyles.liContainer}/>
        </SafeAreaView>);

    }
};

export default App;

var listStyles = StyleSheet.create({
    li: {
        borderBottomColor: '#c8c7cc',
        borderBottomWidth: 0.5,
        paddingTop: 15,
        paddingRight: 15,
        paddingBottom: 15,
    },
    liContainer: {
        backgroundColor: '#fff',
        flex: 1,
        paddingLeft: 15,
    },
    liIndent: {
        flex: 1,
    },
    liText: {
        color: '#333',
        fontSize: 17,
        fontWeight: '400',
        marginBottom: -3.5,
        marginTop: -3.5,
    },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  toolbar: {
      backgroundColor: '#51c04d',
      paddingTop: 100,
      paddingBottom: 10,
      flexDirection: 'row',
      justifyContent: 'center'
  },
  toolbarButton: {
      color: 'blue',
      textAlign: 'center',
      flex: 1
  },
  toolbarTouchable: {
	  flex: 1
  },
  mainContainer: {
    flex: 1
  }
});