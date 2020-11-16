import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/analytics'
import firebaseui from 'firebaseui'
import { config } from './config'

firebase.initializeApp(config)
firebase.analytics()

export const db = firebase.firestore()



