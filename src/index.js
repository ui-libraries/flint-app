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

$('#docname-input').val(getUrlDoc())
getDocument(getUrlDoc())
let startOffset, endOffset, selectionText, currentId, mainText

$('#doc-submit').click(e => {
    let document = $('#docname-input').val()
    document = cleanId(document)
    getDocument(document)
})

function getDocument(document) {
    $('#docname-input').val(document)
    const snapshot = db.collection('pages').where('id', '==', document).get()
    snapshot.then(data => {
        if (data.empty == true) {
            alert("No email found")
        }
        data.forEach(doc => {
            currentId = doc.id
            let flintData = doc.data()
            $('#textarea').load(text_cloudfront + document + ".txt", data => {
              mainText = $('#textarea').html()
                $("#pdf").attr("href", pdf_cloudfront + document + ".pdf")
                let el = window.document.getElementById('textarea')
                el.addEventListener('mouseup', () => {
                    if (window.getSelection) {
                        let sel = window.getSelection()
                        selectionText = sel.toString()
                        let range = sel.getRangeAt(0)
                        startOffset = range.startOffset
                        endOffset = startOffset + range.toString().length

                        let modal = $('#selectionModal')
                        modal.find('#modalTitle').text(selectionText)
                        modal.find('.modal-body').html(`<p>Selection start: ${startOffset}</p><p>Selection end: ${endOffset}</p><label for="note">Add note:</label><input type="text" id="note" name="note">`)
                        if (selectionText.length > 0) {
                            $('#selectionModal').modal()
                        }
                    }
                }, false)
            }) // jQuery load
            $('#annotations').empty()
            displayAnnotationCards(flintData.annotations)
        })
    })
}

$('#save-changes').click(e => {
    let note = $('#note').val()

    db.collection('pages').doc(currentId).update({
        annotations: firebase.firestore.FieldValue.arrayUnion({
            selection: selectionText,
            start: startOffset,
            end: endOffset,
            note: note,
            time: moment().valueOf()
        })
    })
    $('#selectionModal').modal('hide')
    getDocument($('#docname-input').val())
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
            getDocument(docData.id)
        })
    })
})

$('#annotations').on('click', '.card', e => {
  $( "#annotations" ).children().css( 'box-shadow', '0px 0px 0px #888')
  $(e.currentTarget).css('box-shadow', '10px 10px 5px #888')
 let content = $( e.currentTarget ).find( "h6" ).html()
 let matches = content.match(/(\d+)/g)
 highlightSelection(matches)
})

function highlightSelection(rangeNumbers) {
  $('#textarea').empty().html(mainText)
  const element = document.getElementById('textarea')
  const textNode = element.childNodes[0]
  const range = window.document.createRange()
  range.setStart(textNode, rangeNumbers[0])
  range.setEnd(textNode, rangeNumbers[1])
  const mark = document.createElement('mark')
  range.surroundContents(mark)
}

function cleanId(document) {
    let doc
    doc = document.substring(document.lastIndexOf("/") + 1)
    if (doc.includes('.')) {
        doc = doc.slice(0, -4)
    }
    return doc
}

function getUrlDoc() {
    let page = location.href.split('/').slice(-1)[0]
    page = page.split('?d=')
    let file = page[1]

    if (file) {
        return file
    } else {
        return 'deq14_b1008_3230_3230_1'
    }
}

function displayAnnotationCards(annotations) {
    if (annotations) {
        annotations.forEach(item => {
            let time = moment(time).format("DD MMM YYYY hh:mm a")
            let html = `<div class="card" style="width: 20rem;">
<div class="card-body">
  <h4 class="card-title">${item.selection}</h4>
  <h6 class="card-subtitle mb-2 text-muted">start: ${item.start} end: ${item.end}</h6>
  <h5 class="card-text">${item.note}</h5>
  <p">created: ${time}</p>
</div>
</div>`
            $('#annotations').append(html)

        })
    }
}

/*
flintIds.forEach(id => {
  const res = db.collection('pages').add({
    id: id['id']
  })
})
*/