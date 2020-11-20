import firebase from 'firebase/app'
import 'firebase/firestore'
import {
    db
} from './database'
import {
    flintIds
} from './flint-ids-test'

const text_cloudfront = 'http://d1us66xhqwx73c.cloudfront.net/'
const pdf_cloudfront = 'http://d3o55pxnb4jrui.cloudfront.net/'
$('#docname-input').val('deq14_b1005_3226_3226_1')
getDocument('deq14_b1005_3226_3226_1')

$('#doc-submit').click(e => {
    let document = $('#docname-input').val()
    document = cleanId(document)
    getDocument(document)
})

function getDocument(document) {
    const snapshot = db.collection('pages').where('id', '==', document).get()
    snapshot.then(data => {
        if (data.empty == true) {
            alert("No email found")
        }
        data.forEach(doc => {
            let flintId = doc.id
            let flintData = doc.data()
            $('#textarea').load(text_cloudfront + document + ".txt", data => {
                let el = window.document.getElementById('textarea')
                el.addEventListener('mouseup', () => {
                    if (window.getSelection) {
                        let sel = window.getSelection()
                        let selectionText = sel.toString()
                        let range = sel.getRangeAt(0)
                        let startOffset = range.startOffset
                        let endOffset = startOffset + range.toString().length
                        let modal = $('#selectionModal')
                        modal.find('#modalTitle').text(selectionText)
                        modal.find('.modal-body').html(`<p>Selection start: ${startOffset}</p><p>Selection end: ${endOffset}</p><label for="note">Add note:</label>
            <input type="text" id="note" name="note">`)
                        if (selectionText.length > 0) {
                            $('#selectionModal').modal()
                            $('.btn-primary').click(e => {
                                let note = $('#note').val()
                                let date = new Date()
                                db.collection('pages').doc(flintId).update({
                                    annotations: firebase.firestore.FieldValue.arrayUnion({
                                        selection: selectionText,
                                        start: startOffset,
                                        end: endOffset,
                                        note: note,
                                        time: date
                                    })
                                })
                                modal.modal('hide')
                            })
                        }
                    }
                }, false)
            }) // jQuery load

        })
    })

}

function cleanId(document) {
  let doc
  doc = document.substring(document.lastIndexOf("/")+1)
  if (doc.includes('.')) {
    doc = doc.slice(0, -4)
  }
  return doc
}

const myQuery = db.collection('pages').orderBy('id').startAt('deq14_b1005_3226_3226_1').limit(2).get()


/*
db.collection('pages').doc('21WCLmFvBzAJGn7RIjSl').set({
  selection: "Brad",
  start: 120,
  end: 127,
  note: "figure it out"
}, { merge: true })
*/

/* add new annotation
db.collection('pages').doc('21WCLmFvBzAJGn7RIjSl').update({
  annotations: firebase.firestore.FieldValue.arrayUnion({
    selection: "Susan",
    start: 144,
    end: 156,
    note: "you are not racist"
  })
})
*/




/*
flintIds.forEach(id => {
  const res = db.collection('pages').add({
    id: id['id']
  })
})
*/