<template>
  <div class="zoraSection">
    <div class="zoraWrapper">
      <video class="zoraVideo" width="768" height="768" src="">
        Zora
      </video>
      <img class="zoraItem" src="" />
    </div>
    <div class="textOutline zoraText">
      <div>
        <span class="zoraUsername">someone</span> got:
      </div>
      <div class="zoraItemSection">
        <span class="zoraItemName">10 bombs</span>!
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import ReconnectingWebSocket from "reconnecting-websocket";
import $ from "jquery";

export default defineComponent({
  data() {
    return {
      inProgress: false,
      queue: [],
      socket: null,
    };
  },
  async created() {
    const url = `wss://${window.location.hostname}/events/${this.$route.params.username}`;

    this.socket = new ReconnectingWebSocket(url);

    this.socket.addEventListener("message", this.onMessage);
    this.socket.addEventListener("open", () => console.log("Connected to WebSocket"));
    this.socket.addEventListener("close", (event) => console.log(`Disconnected from WebSocket: {code: ${event.code}, reason: ${event.reason}}`));
  },
  mounted() {
    $('.zoraItem').hide();
    $('.zoraSection').hide();
    $('.zoraVideo').on('ended', this.zoraEnded);
    setInterval(this.ping, 25000);
  },
  methods: {
    ping() {
      if (this.socket) {
        this.socket.send(JSON.stringify({type: "ping"}));
      }
    },
    onMessage(event) {
      try {
        const json = JSON.parse(event.data);
        this.enqueueZora(json);
      } catch (err) {
        console.log(err);
      }
    },
    enqueueZora(data) {
      if (this.inProgress) {
        this.queue.push(data);
      } else {
        this.zora(data);
      }
    },
    zoraEnded() {
      $('.zoraSection').hide();
      $('.zoraItem').hide();
      this.queueNext();
    },
    queueNext() {
      if (this.queue.length > 0) {
        setTimeout(() => this.zora(this.queue.shift()), 1000);
      } else {
        this.inProgress = false;
      }
    },
    zora(data) {
      this.inProgress = true;
      $('.zoraSection').show();

      var $video = $('.zoraVideo')[0];
      $video.src = "/zora.webm";
      $video.play();

      $('.zoraItem').attr('src', data.itemSrc);

      $('.zoraUsername').text(data.username);
      $('.zoraItemSection').hide();
      $('.zoraItemName').text(data.itemDisplay);
      setTimeout(this.showItem, 2466);
      setTimeout(this.showItemName, 2600);
      setTimeout(this.playItemFanfare, 2700);
    },
    showItem() {
      $('.zoraItem').show();
    },
    showItemName() {
      $('.zoraItemSection').show();
    },
    playItemFanfare() {
      new Audio('/item_get.mp3').play();
    },
  },
});
</script>

<style>
.zoraSection {
  text-align: center;
  opacity: 1.0;
}

.wrapper {
  position: relative;
  display: inline-block;
}

@keyframes itemFall {
  0%    {top: 400px; animation-timing-function: linear;}
  0.5%  {top: 392px;}
  1.5%  {top: 384px;}
  2%    {top: 376px;}
  3.5%  {top: 368px;}
  6%    {top: 376px;}
  7%    {top: 384px;}
  7.5%  {top: 392px;}
  8.5%  {top: 400px;}
  16%   {top: 640px;}
  21.5% {top: 600px;}
  21.5% {top: 600px; animation-timing-function: ease;}
  33%   {top: 648px;}
  72%   {top: 648px; visibility: hidden;}
  100%  {top: 648px; visibility: hidden;}
}

.zoraItem {
  position: absolute;
  width: 128px;
  height: 128px;
  object-fit: contain;
  left: 50%;
  top: 400px;
  -webkit-transform: translate(-50%);
  -moz-transform: translate(-50%);
  -ms-transform: translate(-50%);
  transform: translate(-50%);
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
  animation-name: itemFall;
  animation-duration: 3.33s;
  animation-timing-function: linear;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
}

.textOutline {
  color: white;
  text-shadow:
    2px 0px 0px #000000,
    0px 2px 0px #000000,
    -2px 0px 0px #000000,
    0px -2px 0px #000000,
    1px 1px 0px #000000,
    1px -1px 0px #000000,
    -1px 1px 0px #000000,
    -1px -1px 0px #000000;
}

.zoraText {
  font-size: 26pt;
}
</style>
