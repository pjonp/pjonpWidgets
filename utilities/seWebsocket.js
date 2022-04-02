/*
Copyright 2022 pjonp
This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

/*
//HTML
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.js"
        integrity="sha256-yr4fRk/GU1ehYJPAs8P4JlTgu0Hdsp4ZKrx8bDEDC3I=" crossorigin="anonymous"></script>
*/
//requires socket.io 2.2.0; must be 2.2!
function seSocketLoader(apiToken) {
  return new Promise((res, rej) => {
    const socket = io('https://realtime.streamelements.com', {
      transports: ['websocket']
    });
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('authenticated', onAuthenticated);
    socket.on('unauthorized', onUnauthorized);

    function onConnect() {
      console.log('Trying to connect to SE websocket.');
      socket.emit('authenticate', {
        method: 'apikey',
        token: apiToken
      });
    };
    function onDisconnect() {
      console.error('Disconnected from websocket');
    };
    function onAuthenticated(data) {
      console.log(`Successfully connected to SE websocket.`);
      res(socket);
    };
    function onUnauthorized(data) {
      console.error(`could not connect to SE websocket; unauthorized`);
      rej(data);
    };
  });
};
</script>

/* JS EXAMPLE
let SeSocket;
window.addEventListener('onWidgetLoad', obj => {
  const fieldData = obj.detail.fieldData;
  const apiToken = obj.detail.channel.apiToken;

  seSocketLoader(apiToken).then(socket => {
    SeSocket = socket;
    handleConnect();
  }).catch(e => {
    handleFail();
  });
});

function emitMsg(listener = 'custom', count, delay) {

  // SEND AS: obj.detail.event.  ....
  // obj.detail.event.secret => 1 for secondary widget
  const webSocketEvent = {
    "listener": listener,
    "service": "custom",
    "secret": 1,
    "secDelay": delay,
    "data": {
      count: count,
    },
  };
  SeSocket.emit('event:test', webSocketEvent); //'event:test' //unsure of other events
};

let count1 = 0;
let count2 = 0;

function handleConnect() {
  setInterval(_ => {
    count1++;
    emitMsg('secretEvent1', count1, 2)
  }, 2 * 1000);

  setInterval(_ => {
    count2++;
    emitMsg('secretEvent2', count2, 10)
  }, 10 * 1000);

};

function handleFail() {
  //handle failure
};
*/
