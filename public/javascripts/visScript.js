const colors = ['#0fcbaa', '#FFD123', '#6EEB83', '#FF5714', '#1BE7FF', '#C823FF', '#FF0000', '#B5651D'];
const maxLabelSize = 21;
let originalNodes;
let originalEdges;

const findNodeById = (id) => {
  console.log('entrou')
  const node = originalNodes.filter(n => n.id === id);
  return node[0];
};

const showNodeModal = (node) => {
  const infoKeys = Object.keys(node.info);
  let fullInfo = [];
  infoKeys.forEach(key => {
    const info = '<strong>' + key[0].toUpperCase() + key.substring(1) + '</strong>: ' + node.info[key] + ' <br> ';
    (key === 'nome') ? fullInfo.unshift(info) : fullInfo.push(info);
  });
  $('#modalTitle').text(node.type[0].toUpperCase() + node.type.substring(1));
  $('#modalBody').empty().append('<p>' + fullInfo.join('') + '</p>');
  $('#modalNode').modal('show'); 
}; 

const findOutTypes = (nodes) => {
  const types = new Set(nodes.map(n => n.type));
  return ({type: [...types]});
};

const receiveGraphData = async () => {
  const sessionData = sessionStorage.getItem('graphData');
  if (!!sessionData) return JSON.parse(sessionData);
  const graphData = await fetch('api/graph', { method: 'GET'}).then(response => response.json());
  return graphData;
};

const prepareNetworkInteraction = (network) => {
  network.on("click", function (params) {
    const nodeId = this.getNodeAt(params.pointer.DOM);
    if (!!nodeId) {
      showNodeModal(findNodeById(nodeId));
    }
  });
};

const prepareGraph = (graph) => {
  const container = document.getElementById('mynetwork');
  const data = {
      nodes: graph.nodes,
      edges: graph.edges
  };
  const options = {
    physics: {
        forceAtlas2Based: {
            gravitationalConstant: -26,
            centralGravity: 0.005,
            springLength: 230,
            springConstant: 0.18
        },
        maxVelocity: 106,
        solver: 'forceAtlas2Based',
        timestep: 0.35,
        stabilization: {iterations: 150}
    },
    interaction: {hover:true},
    nodes: {
      shape: 'circle',
      scaling: {
          // label: {
          //     enabled: true,
          //     min: 200,
          //     max: 200
          // }
      },
      // size: 100,
      font: {size: 20},
      // widthConstraint: {
        // maximum: 250,
        // minimum: 250
      // }
    },
    edges: {
      width: 5,
      smooth: true,
      arrows: {
        to: {
          enabled: true, scaleFactor: 1.5, type:'arrow'
        }
      }
    }    
  };
  const network = new vis.Network(container, data, options);
  prepareNetworkInteraction(network);
};

$(document).ready(() => {
  $.get( "api/graph", function( response ) {
    let dados = jQuery.parseJSON(response)
    originalNodes = dados.nodes;
    originalEdges = dados.edges;
    console.log(dados.nodes);
    console.log(dados.edges);
    prepareGraph(dados);
  });
});