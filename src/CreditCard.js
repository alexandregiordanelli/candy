import React from 'react'
import { LiteCreditCardInput } from "react-native-credit-card-input"
import {
    Button,
    KeyboardAvoidingView,
  } from 'react-native'
import { Navigation } from "react-native-navigation"

export default (props) => 
<KeyboardAvoidingView behavior={'padding'} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <LiteCreditCardInput onChange={()=>{}} inputStyle={{fontSize: 21, color: 'white'}} />
    <Button color='#fc6157' title='Adicionar Cartão' onPress={()=>Navigation.dismissAllModals()}/>
</KeyboardAvoidingView>