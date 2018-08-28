/* eslint-disable */

const handleXMLClick = () => {
  $('#xmlUpload').click();
};

const handleXMLFileCharge = async () => {
  const file = $('#xmlUpload').prop('files')[0];
  if (file.type !== 'text/xml') {
    alert('Not a XML, you dummy');
    return;
  }
  console.log('Receiving Database');
  const response = await fetch('/api/graph', { method: 'POST', headers: { "Content-Type": "application/xml" }, body: file})
                         .then(response => response.json());
  checkResponse(response);
};

const checkResponse = (json) => {
  if (!!json.response && json.response === 'error') {
    alert('Deu merda');
  };
  sessionStorage.setItem('graphData', JSON.stringify(json));
  $(location).attr('href', '/vis');
};

$(document).ready(() => {
  $("#buttonUpload").on("click", handleXMLClick);
  $("#xmlUpload").on("change", handleXMLFileCharge);
});