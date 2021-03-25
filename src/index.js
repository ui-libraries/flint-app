import firebase from 'firebase/app'
import 'firebase/firestore'
import {
    db,
    auth
} from './database'
import {
    flintIds
} from './flint-ids-test'

const text_cloudfront = 'http://d1us66xhqwx73c.cloudfront.net/'
const pdf_cloudfront = 'http://d3o55pxnb4jrui.cloudfront.net/'

$('#annotations').hide()
$('#options-button').hide()
$('#toggle-annotations').hide()

$('#docname-input').val(getUrlDoc())
getDocument(getUrlDoc())
let startOffset, endOffset, selectionText, currentId, previousIds = [],
    mainText, User

auth.onAuthStateChanged(user => {
    if (user) {
        User = user
        $('#dashboard-username').html(user.email)
        $('#options-button').show()
        $('#toggle-annotations').show()
    } else {
        console.log('no user found')
        User = undefined
        alert('logged out')
    }
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
                $('#annotations').empty()
                displayAnnotationCards(flintData.annotations)
            }) // jQuery load

        })
    })
}

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
        return 'deq14_b1198_3592_3605_14'
    }
}

function getRecentAnnotations(limit) {
    let snapshot = db.collection('recents').orderBy('time', 'desc').limit(limit).get()
    snapshot.then(data => {
        data.forEach(doc => {
            let anno = doc.data()
            let time = moment(anno.time).format("DD MMM YYYY hh:mm a")
            let html = `
      <div class="col-md-4">
          <div class="card">
            <div class="card-block">
              <h4 class="card-title">${anno.selection}</h4>
              <h6 class="card-subtitle text-muted">start: ${anno.start} end: ${anno.end}</h6>
              <textarea required readonly class="card-text">${anno.note}</textarea>
              <p><a href="index.html?d=${anno.id}" class="card-link">${anno.id}</a></p>
              <p>created: ${time}</p>
              <i class="fa fa-edit"></i>
              <i class="fa fa-trash"></i>
            </div>
          </div>
        </div>
      `
            $('#recent-annotations').append(html)
        })
        $('.fa-edit').click(e => {
            let el = $(e.currentTarget).parent().find("textarea")
            let re = $(el).prop('readonly')
            $(el).prop('readonly', !re)
            $(el).css("border", "1px solid rgb(0 0 0 / 10%)")
            $(e.currentTarget).parent().append('<i class="fa fa-save"></i>')
            $('.fa-save').click(evt => {
                console.log("saving to database...")
                $(el).css("border", "0px")
            })
        })        
    })    
}

function displayAnnotationCards(annotations) {
    let annoItem
    if (annotations) {
        annotations.forEach(item => {
            let time = moment(item.time).format("DD MMM YYYY hh:mm a")
            let html = `
            <div class="card" style="width: 20rem;">
              <div class="card-block">
                <h4 class="card-title">${item.selection}</h4>
                <h6 class="card-subtitle mb-2 text-muted">start: ${item.start} end: ${item.end}</h6>
                <textarea required readonly class="card-text">${item.note}</textarea>
                <p class="card-time">created: ${time}</p>
                <i class="fa fa-edit"></i>&nbsp;&nbsp;&nbsp;&nbsp;
                <i class="fa fa-trash"></i>&nbsp;&nbsp;&nbsp;&nbsp;
              </div>
            </div>
            `
            $('#annotations').append(html)
        })
    }
    $('.fa-edit').click(e => {
        let el = $(e.currentTarget).parent().find("textarea")
        let re = $(el).prop('readonly')
        $(el).prop('readonly', !re)
        $(el).css("border", "1px solid rgb(0 0 0 / 10%)")
        $(e.currentTarget).parent().append('<i class="fa fa-save"></i>')
        $('.fa-save').click(evt => {
            let doc = $('#docname-input').val()
            let time = $(e.currentTarget).parent().find(".card-time").html()
            let annoItem = {
                selection: $(e.currentTarget).parent().find(".card-title").html(),
                note: $(e.currentTarget).parent().find(".card-text").html()
            }
            let newNote = $(e.currentTarget).parent().find("textarea").val()
            editAnnotationCard(annoItem, doc, newNote)
            $(el).css("border", "0px")
        })
    })
    $('.fa-trash').click(e => {
        let doc = $('#docname-input').val()
        let annoItem = {
            selection: $(e.currentTarget).parent().find(".card-title").html(),
            note: $(e.currentTarget).parent().find(".card-text").html()
        }
        deleteAnnotation(annoItem, doc)
        $(e.currentTarget).parent().parent().remove()

    })
}

function editAnnotationCard(item, docId, newNote) {
    const snapshot = db.collection('pages').where('id', '==', docId).get()
    snapshot.then(data => {
        data.forEach(doc => {
            let docData = doc.data()
            let annotations = docData.annotations
            let annoItem
            for (let i = 0; i < annotations.length; i++) {
                if (annotations[i].selection == item.selection && annotations[i].note == item.note) {
                    annoItem = annotations[i]
                    annoItem.note = newNote
                    annotations[i] = annoItem
                }
            }
            db.collection('pages').doc(currentId).set({annotations: annotations, "id": docId})
        })
    })
}

function deleteAnnotation(item, docId) {
    const snapshot = db.collection('pages').where('id', '==', docId).get()
    snapshot.then(data => {
        data.forEach(doc => {
            let docData = doc.data()
            let annotations = docData.annotations
            for (let i = 0; i < annotations.length; i++) {
                console.log(annotations[i])
                if (annotations[i].selection == item.selection && annotations[i].note == item.note) {
                    annotations.splice(i, 1)
                }
            }
            db.collection('pages').doc(currentId).set({annotations: annotations, "id": docId})
        })
    })
}



$('#doc-submit').click(e => {
  let document = $('#docname-input').val()
  document = cleanId(document)
  getDocument(document)
})

$('#save-changes').click(e => {
  let note = $('#note').val()

  db.collection('pages').doc(currentId).update({
      annotations: firebase.firestore.FieldValue.arrayUnion({
          selection: selectionText,
          start: startOffset,
          end: endOffset,
          note: note,
          user: User.email,
          time: moment().valueOf()
      })
  })
  db.collection('recents').add({
      id: $('#docname-input').val(),
      selection: selectionText,
      start: startOffset,
      end: endOffset,
      note: note,
      user: User.email,
      time: moment().valueOf()
  })
  $('#selectionModal').modal('hide')
  getDocument($('#docname-input').val())
})

$('#options-submit').click(e => {
  if ($('#firstround-box').is(":checked")) {
      db.collection('pages').doc(currentId).update({
          first_round: true
      })
  } else {
      db.collection('pages').doc(currentId).update({
          first_round: false
      })
  }

  if ($('#intercoder-box').is(":checked")) {
      db.collection('pages').doc(currentId).update({
          intercoder: true
      })
  } else {
      db.collection('pages').doc(currentId).update({
          intercoder: false
      })
  }
  $('#optionsModal').modal('hide')
})

$('#next').click(e => {
  let id = $('#docname-input').val()
  previousIds.push(id)
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

$('#prev').click(e => {
  let prevId = previousIds[previousIds.length - 1]
  $('#docname-input').val(prevId)
  previousIds.pop()
  getDocument(prevId)
})

$('#annotations').on('click', '.card', e => {
  $("#annotations").children().css('box-shadow', '0px 0px 0px #888')
  $(e.currentTarget).css('box-shadow', '10px 10px 5px #888')
  let content = $(e.currentTarget).find("h6").html()
  let matches = content.match(/(\d+)/g)
  highlightSelection(matches)
})

$('#toggle-annotations').click(e => {
  $('#annotations').toggle()
})

$('#newuser-button').click(e => {
    let email = $('#input-email').val()
    let pw = $('#input-password').val()
    auth.createUserWithEmailAndPassword(email, pw)
        .then((user) => {
            console.log(user.uid)
        })
        .catch((error) => {
            let errorCode = error.code;
            let errorMessage = error.message
            console.log(errorCode, errorMessage)
        })
})

$('#account-button').click(e => {
    if (User) {
        window.location = "dashboard.html"
    } else {
        $('#signinModal').modal()
    }
})

$('#signout-button').click(e => {
    firebase.auth().signOut().then(() => {
        console.log("signed out")
    }).catch(error => {
        console.log(error)
    })
})

$('#options-button').click(e => {
    const snapshot = db.collection('pages').doc(currentId).get()
    snapshot.then(doc => {
        let data = doc.data()
        $('#firstround-box').prop("checked", true)
        $('#intercoder-box').prop("checked", true)
        if (data.first_round !== true) {
            $('#firstround-box').prop("checked", false)
        }
        if (data.intercoder !== true) {
            $('#intercoder-box').prop("checked", false)
        }
        $('#optionsModal').modal()
    })

})

if ($('#recent-annotations').length > 0) {
    getRecentAnnotations(100)
}



/*
flintIds.forEach(id => {
  const res = db.collection('pages').add({
    id: id['id']
  })
})
*/