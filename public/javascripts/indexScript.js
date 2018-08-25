/* eslint-disable */

const handleXMLClick = () => {
  $('#xmlUpload').click();
};

const handleXMLFileCharge = () => {
  const file = $('#xmlUpload').prop('files')[0];
  const url = '/api/graph';
  if (file.type !== 'text/xml') {
    return;
  }
  fetch(url, {
    method: 'POST',
    headers: {
      "Content-Type": "application/xml"
    },
    body: file
  }).then(response => response.json())
    .then((json) => {
      console.log(json);
      // windows.location.href = json.link;
      // console.log(json.link);
      // $(location).attr('href', json.link);
    });
};


$(document).ready(function () {

});