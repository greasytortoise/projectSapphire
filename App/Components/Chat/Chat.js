'use strict';

var React = require('react-native');
var Firebase = require('firebase');
var reactfire = require('reactfire');
var firebaseUrl = require('../../Utils/config')
var ChatMessage = require('./ChatMessage');
var api = require('../../Utils/api.js');

import Listings from '../Listings/Listings.js';

var {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight,
  ScrollView,
  AsyncStorage
} = React;

class Chat extends React.Component{

  mixins: [reactfire]
  constructor(props) {
    super(props);
    this.state = {
      items: []
    };
    this.ref = new Firebase(firebaseUrl + '/chat/' + props.listingCreatedBy);

    this.user = {};
    AsyncStorage.getItem('name').then(name => {
      this.user.name = name;
    });
    AsyncStorage.getItem('authData').then(authData => {
      var currentUserId = JSON.parse(authData).uid
      this.user.id = currentUserId;
    });


  }

  componentWillMount() {
    var that = this;
    this.ref.on('value', function(snapshot) {
      var items = [];
      snapshot.forEach(child => {
        items.push(child.val());
      });
      this.setState({ 'items': items });

    }.bind(this));

    this.ref.on('child_removed', function(snapshot) {
      this.props.navigator.pop();

    }.bind(this));

  }

  componentWillUnmount() {
    AsyncStorage.getItem('authData').then(authData => {
      var currentUserId = JSON.parse(authData).uid;
      if(currentUserId === this.props.listingCreatedBy) {
        api.deleteListing(currentUserId, () => {
          console.log('THING HAPPENED');
          api.destroyChat(currentUserId, () => {
            console.log('Live Long and Prosper');
          })
        });
      }
    });

  }

  _onPressButton() {
    this.ref.push({ author: this.user, message: this.state.text });
    this.setState({text: ''});
  }

  createMessage(message, index) {
    return(
      <ChatMessage
        key = {index}
        currentUserId = {this.user.id}
        message = {message}
        navigator = {this.props.navigator}/>
    );
  };

  render() {

    return (
      <View style={styles.container}>
        <ScrollView ref='_scrollView' style={styles.messages}>
          {this.state.items.map(this.createMessage.bind(this))}
        </ScrollView>
        <TextInput
          style={styles.textInput}
          onChangeText={(text) => this.setState({ text: text})}
          value={this.state.text}
          placeholder="message"
          autoFocus = {true}
          />
        <TouchableHighlight
          style={styles.SubmitButton}
          onPress={this._onPressButton.bind(this)}>
          <Text>Send</Text>
        </TouchableHighlight>
        <View style={styles.innerContainer}>
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    backgroundColor: '#cce4d0',
    flex: 1,
    flexDirection: 'column',
    marginBottom: 198,
    alignSelf: 'stretch'
  },
  innerContainer: {
    flex: .1,
  },
  messages: {
    flex:8,
    marginLeft:15,
    marginRight:15,
  },
  message: {
    marginTop:8
  },
  messageUsername: {
    color: '#999'
  },
  messageText: {
    backgroundColor: '#eee',
    borderRadius: 10,
    paddingTop:7,
    paddingBottom:7,
    marginRight:90,
    paddingLeft:10,
    paddingRight:10
  },
  messageTextAuthor: {
    backgroundColor: '#30fca0',
    borderRadius: 10,
    color: '#fff',
    textAlign: 'right',
    marginLeft:90,
    paddingTop:7,
    paddingBottom:7,
    paddingLeft:15,
    paddingRight:15
  },
  textInput: {
    height: 50,
    marginTop:5,
    marginBottom:4,
    paddingTop:5,
    paddingBottom:5,
    paddingLeft:15,
    paddingRight:15,
    backgroundColor: '#eee',
    flex: 1,
    fontSize: 15,
    color: '#333',
    borderColor: '#ddd',
    borderWidth: 1
  },
  SubmitButton: {
    paddingTop:15,
    paddingBottom:15,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,.30)',
    alignSelf: 'stretch',
    marginTop:8,
    marginBottom:60,
    marginTop: 0
  }
});

module.exports = Chat;
