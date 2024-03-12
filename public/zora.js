// const socket = io();

var inProgress = false;
var queue = [];

/*
socket.on("connect", () => {
  console.log(`connected: ${socket.id}`);
  socket.send("register", username);
});

socket.on("disconnect", (reason) => {
  console.log(`disconnected: ${reason}`);
});

socket.on("message", function(...args) {
  if (args.length >= 2 && args[0] === "zora") {
    enqueueZora(args[1]);
  }
});
*/

function enqueueZora(data) {
  if (inProgress) {
    queue.push(data);
    return;
  } else {
    zora(data);
  }
}

function zora(data) {
  inProgress = true;
  $('.zoraSection').show();

  var $video = $('.zoraVideo')[0];
  $video.src = "zora.webm";
  $video.play();

  $('.zoraUsername').text(data.username);
  $('.zoraItemSection').hide();
  $('.zoraItemName').text(data.itemDisplay);
  setTimeout(showItem, 2466);
  setTimeout(showItemName, 2600);
};

function showItem() {
  $('.zoraItem').show();
};

function showItemName() {
  $('.zoraItemSection').show();
};

/*
socket.onclose = function() {
  console.log("Connection Closed!");
};
*/

$(document).ready(function() {
  $(".test-btn").on('click', function() {
    enqueueZora({username: "Gwaaer", itemDisplay: "Flippers"});
  });

  $('.zoraItem').hide();
  $('.zoraSection').hide();
  $('.zoraVideo').on('ended', function() {
    $('.zoraItem').hide();
    $('.zoraSection').hide();
    if (queue.length > 0) {
      setTimeout(() => zora(queue.shift()), 1000);
    } else {
      inProgress = false;
    }
  });
});
