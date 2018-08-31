/* eslint-disable */

const dim = (bool) => {
  if (typeof bool=='undefined') bool=true; // so you can shorten dim(true) to dim()
  document.getElementById('dimmer').style.display=(bool?'block':'none');
}

const handleXMLClick = () => {
  $('#xmlUpload').click();
};

const handleXMLFileCharge = async () => {
  const file = $('#xmlUpload').prop('files')[0];
  if (!!file && file.type !== 'text/xml') {
    alert('Not a XML, you dummy');
    return;
  }
  dim(true);
  $('#loader').show();
  console.log('Receiving Database');
  const response = await fetch('/api/graph', { method: 'POST', headers: { "Content-Type": "application/xml" }, body: file})
                         .then(response => response.json());
  checkResponse(response);
};

const checkResponse = (json) => {
  if (!!json.response && json.response === 'error') {
    dim(false);
    $('#loader').hide();
    alert('Deu merda');
    return;
  }
  sessionStorage.setItem('graphData', JSON.stringify(json));
  $(location).attr('href', '/vis');
};

$(document).ready(() => {
  document.getElementById("xmlUpload").value = "";
  $("#buttonUpload").on("click", handleXMLClick);
  $("#xmlUpload").on("change", handleXMLFileCharge);
});