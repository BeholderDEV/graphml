const colors = ['#0fcbaa', '#FFD123', '#6EEB83', '#FF5714', '#1BE7FF', '#C823FF', '#FF0000', '#B5651D'];

const initializeGraph = async () => {
  const graphData = await receiveGraphData();
  const types = findOutTypes(graphData.nodes);
  const nodeStyles = prepareNodeStyles(graphData.nodes, types.type);
  const config = {
    // dataSource: graphData,
    dataSource: 'api/graph',
    forceLocked: true,
    linkDistance: () => { return 40; },
    nodeTypes: types,
    nodeStyle: nodeStyles,
    nodeClick: (node) => {
      showNodeModal(node._properties);
      return node._properties.caption;
    },
    caption: (node) => { 
        return node.caption; 
    }
  };
  alchemy = new Alchemy(config);
};

const showNodeModal = (node) => {
  const infoKeys = Object.keys(node.info);
  let fullInfo = [];
  infoKeys.forEach(key => {
    const info = key[0].toUpperCase() + key.substring(1) + ': ' + node.info[key] + ' <br> ';
    (key === 'nome') ? fullInfo.unshift(info) : fullInfo.push(info);
  });
  $('#modalTitle').text(node.type[0].toUpperCase() + node.type.substring(1));
  $('#modalBody').empty().append('<p>' + fullInfo.join('') + '</p>');
  $('#modalNode').modal('show'); 
};

const prepareNodeStyles = (nodes, types) => {
  const style = {"all": 
  {
    radius: 10, 
    color: "#faf", 
    borderColor: "#fff", 
    // captionColor: "#B5651D",
    captionSize: 2,
    borderWidth: 2,
  }};
  types.forEach((t, i) => {
    style[t] = {
      color: colors[i % colors.length],
      
      selected: {
        color: "#FFFFFF",
        borderColor: "#349FE3"
      },
      highlighted: {
        color: "#EEEEFF"
      }
    };
  });
  return style;
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

$(document).ready(() => {
  initializeGraph();
});