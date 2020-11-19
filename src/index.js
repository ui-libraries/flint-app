import { db } from './database'
import { flintIds } from './flint-ids-test'

const text_cloudfront = 'http://d1us66xhqwx73c.cloudfront.net/'
const pdf_cloudfront = 'http://d3o55pxnb4jrui.cloudfront.net/'
const document = 'deq14_b1006_3227_3228_1'

$('#textarea').load(text_cloudfront + document + ".txt", data => {
  let el = window.document.getElementById('textarea')
  el.addEventListener('mouseup', () => {
    if (typeof window.getSelection != 'undefined') {
        let sel = window.getSelection()
        let range = sel.getRangeAt(0)
        
        let startOffset = range.startOffset
        let endOffset = startOffset + range.toString().length

        let modal = $('#selectionModal')
        modal.find('#modalTitle').text(sel)
        modal.find('.modal-body').html(`<p>Selection start: ${startOffset}</p><p>Selection end: ${endOffset}</p>`)
        $('#selectionModal').modal()
    }
  }, false)
})




/*
flintIds.forEach(id => {
  const res = db.collection('pages').add({
    id: id['id']
  })
})
*/