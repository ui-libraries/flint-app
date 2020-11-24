import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/analytics'
import 'firebaseui'
import { config } from './config'

firebase.initializeApp(config)
firebase.analytics()

export const db = firebase.firestore()
export const auth = firebase.auth()

const uiConfig = {
    signInSuccessUrl: "annotations.html",
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      firebase.auth.EmailAuthProvider.PROVIDER_ID
    ]
  }

  const ui = new firebaseui.auth.AuthUI(firebase.auth())
  ui.start('#firebaseui-auth-container', uiConfig)



