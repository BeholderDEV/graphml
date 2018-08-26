/* eslint-disable */

const handleXMLClick = () => {
  $('#xmlUpload').click();
};

const handleXMLFileCharge = () => {
  const file = $('#xmlUpload').prop('files')[0];
  const url = '/api/graph';
  if (file.type !== 'text/xml') {
    alert('Not a XML, you dummy');
    return;
  }
  console.log('wait for it');
  fetch(url, {
    method: 'POST',
    headers: {
      "Content-Type": "application/xml"
    },
    body: file
  }).then(response => response.json()).then(json => checkResponse(json));
};

const checkResponse = (json) => {
  if (!!json.response && json.response === 'error') {
    alert('Deu merda');
  };
  $(location).attr('href', '/graph');
};


$(document).ready(function () {

});