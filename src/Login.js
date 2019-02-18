import React, { Component } from 'react'
import { View, Button, Text, TextInput, StyleSheet, KeyboardAvoidingView } from 'react-native'
import firebase from 'react-native-firebase'

firebase.auth().settings.appVerificationDisabledForTesting = true

export default class extends Component {
  static get options() {
    return {
      topBar: {
        title: {
          text: 'Candy'
        },
      }
    };
  }

  state = {
    message: '',
    codeInput: '',
    phoneNumber: '',
    confirmResult: null,
  }
 
  renderPhoneNumberInput() {
    return (
      <React.Fragment>
        <Text style={styles.text}>Digite seu celular com o código da cidade</Text>
        <TextInput
          autoFocus
          keyboardType={'phone-pad'}
          style={styles.input}
          onChangeText={value => this.setState({ phoneNumber: value })}
          placeholder={'21987654321'}
          placeholderTextColor='#444'
          value={this.state.phoneNumber}
        />
        <Button title="Enviar SMS com código" color="#fc6157" onPress={()=>{
          this.setState({ message: 'Enviando o SMS com o código ...' })
          firebase.auth().signInWithPhoneNumber('+55'+this.state.phoneNumber).then(confirmResult => {
            this.setState({ confirmResult, message: 'Código foi enviado com sucesso!' })
          }).catch(error => {
            this.setState({ message: `Erro: ${error.message}` })
          })
        }} />
      </React.Fragment>
    )
  }
  
  renderVerificationCodeInput() {
    return (
      <React.Fragment>
        <Text style={styles.text}>Digite o código recebido por SMS</Text>
        <TextInput
          autoFocus
          keyboardType={'number-pad'}
          style={styles.input}
          onChangeText={value => this.setState({ codeInput: value })}
          placeholder={'123456'}
          placeholderTextColor='#444'
          value={this.state.codeInput}
        />
        <Button title="Continuar" color="#fc6157" onPress={()=>{
          this.state.confirmResult.confirm(this.state.codeInput).then(() => {
              this.setState({ message: 'Código confirmado! Aguarde..' })
          }).catch(error => {
              this.setState({ message: `Erro ao confirmar o código: ${error.message}` })
          })
        }} />
      </React.Fragment>
    )
  }

  render() {
    return (
      <KeyboardAvoidingView behavior={'padding'} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {!this.state.confirmResult && this.renderPhoneNumberInput()}
        {this.state.confirmResult && this.renderVerificationCodeInput()}
        {!!this.state.message.length && <Text style={styles.msg}>{this.state.message}</Text>}
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  text: {
    color: 'white', fontSize: 16
  },
  input: {
    marginTop: 15, marginBottom: 15, fontSize: 28, color: 'white'
  },
  msg: {
    padding: 5, backgroundColor: '#222', color: '#fff', fontSize: 16
  }
})