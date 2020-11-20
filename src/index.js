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
let startOffset, endOffset, selectionText, currentId

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
            currentId = doc.id
            let flintData = doc.data()
            $('#textarea').load(text_cloudfront + document + ".txt", data => {
              //let text = $('#textarea').html()
              //$('#textarea').html($.trim(text))

                let el = window.document.getElementById('textarea')
                el.addEventListener('mouseup', () => {
                    if (window.getSelection) {
                        let sel = window.getSelection()
                        selectionText = sel.toString()
                        let range = sel.getRangeAt(0)
                        startOffset = range.startOffset
                        endOffset = startOffset + range.toString().length
                        highlightSelection()
                        let modal = $('#selectionModal')
                        modal.find('#modalTitle').text(selectionText)
                        modal.find('.modal-body').html(`<p>Selection start: ${startOffset}</p><p>Selection end: ${endOffset}</p><label for="note">Add note:</label><input type="text" id="note" name="note">`)
                        if (selectionText.length > 0) {
                            $('#selectionModal').modal()
                        }
                    }
                }, false)
            }) // jQuery load

        })
    })
}

function highlightSelection() {
  var userSelection = window.getSelection().getRangeAt(0)
  highlightRange(userSelection)
}

function highlightRange(range) {
  let newNode = document.createElement("div")
  newNode.setAttribute(
     "style",
     "background-color: yellow; display: inline;"
  )
  range.surroundContents(newNode)
}

$('#save-changes').click(e => {
  let note = $('#note').val()
  let date = new Date()
  db.collection('pages').doc(currentId).update({
    annotations: firebase.firestore.FieldValue.arrayUnion({
        selection: selectionText,
        start: startOffset,
        end: endOffset,
        note: note,
        time: date
    })
})
  $('#selectionModal').modal('hide')
})

$('#next').click(e => {
  let id = $('#docname-input').val()
  let nextId
  const snapshot = db.collection('pages').orderBy('id').startAt(id).limit(2).get()
  snapshot.then(data => {
    data.forEach(doc => {
      let docData = doc.data()
      nextId = doc.id
      currentId = nextId
      $('#docname-input').val(docData.id)
      $('#textarea').load(text_cloudfront + docData.id + ".txt", data => {})
    })
  })
})

function cleanId(document) {
  let doc
  doc = document.substring(document.lastIndexOf("/")+1)
  if (doc.includes('.')) {
    doc = doc.slice(0, -4)
  }
  return doc
}

/*
flintIds.forEach(id => {
  const res = db.collection('pages').add({
    id: id['id']
  })
})
*/