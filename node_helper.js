var exec=require("child_process").exec;const{spawn:spawn}=require("child_process"),process=require("process"),fs=require("fs"),path=require("path");var NodeHelper=require("node_helper");const npmCheck=require("@bugsounet/npmcheck"),Screen=require("@bugsounet/screen"),Pir=require("@bugsounet/pir"),Governor=require("@bugsounet/governor"),Internet=require("@bugsounet/internet"),CastServer=require("@bugsounet/cast"),Spotify=require("@bugsounet/spotify"),pm2=require("pm2");var _log=Function.prototype.bind.call(console.log,console,"[A2D]"),log=function(){};module.exports=NodeHelper.create({start:function(){this.config={},timeout=null,retry=null},socketNotificationReceived:function(e,o){switch(e){case"INIT":console.log("[A2D] MMM-Assistant2Display Version:",require("./package.json").version),this.initialize(o);break;case"SET_VOLUME":this.setVolume(o);break;case"SCREEN_LOCK":this.screen&&(o?this.screen.lock():this.screen.unlock());break;case"SCREEN_STOP":this.screen&&this.screen.stop();break;case"SCREEN_RESET":this.screen&&this.screen.reset();break;case"SCREEN_WAKEUP":this.screen&&this.screen.wakeup();break;case"SCREEN_FORCE_END":this.screen&&this.screen.forceEnd();break;case"RESTART":this.pm2Restart(o);break;case"SPOTIFY_RETRY_PLAY":clearTimeout(timeout),timeout=null,clearTimeout(retry),retry=null,retry=setTimeout(()=>{this.spotify.play(o,(e,t,i)=>{if(404==e&&"NO_ACTIVE_DEVICE"==i.error.reason&&(log("[SPOTIFY] RETRY playing..."),this.socketNotificationReceived("SPOTIFY_PLAY",o)),204!==e&&202!==e)return console.log("[SPOTIFY:PLAY] RETRY Error",e,t,i);log("[SPOTIFY] RETRY: DONE_PLAY")})},3e3);break;case"SPOTIFY_PLAY":this.spotify.play(o,(e,t,i)=>{if(clearTimeout(timeout),timeout=null,404==e&&"NO_ACTIVE_DEVICE"==i.error.reason&&this.config.spotify.useLibrespot&&(console.log("[SPOTIFY] No response from librespot !"),pm2.restart("librespot",(e,o)=>{e?console.log("[PM2] librespot error: "+e):console.log("[PM2] restart librespot")}),timeout=setTimeout(()=>{this.socketNotificationReceived("SPOTIFY_TRANSFER",this.config.spotify.connectTo),this.socketNotificationReceived("SPOTIFY_RETRY_PLAY",o)},3e3)),204!==e&&202!==e)return console.log("[SPOTIFY:PLAY] Error",e,t,i);log("[SPOTIFY] DONE_PLAY")});break;case"SPOTIFY_VOLUME":this.spotify.volume(o,(e,t,i)=>{204!==e?console.log("[SPOTIFY:VOLUME] Error",e,t,i):(this.sendSocketNotification("DONE_SPOTIFY_VOLUME",o),log("[SPOTIFY] DONE_VOLUME:",o))});break;case"SPOTIFY_PAUSE":this.spotify.pause((e,o,t)=>{204!==e&&202!==e?console.log("[SPOTIFY:PAUSE] Error",e,o,t):log("[SPOTIFY] DONE_PAUSE")});break;case"SPOTIFY_TRANSFER":this.spotify.transferByName(o,(e,o,t)=>{204!==e&&202!==e?console.log("[SPOTIFY:TRANSFER] Error",e,o,t):log("[SPOTIFY] DONE_TRANSFER")});break;case"SPOTIFY_STOP":pm2.restart("librespot",(e,o)=>{e?console.log("[PM2] librespot error: "+e):log("[PM2] restart librespot")});break;case"SPOTIFY_NEXT":this.spotify.next((e,o,t)=>{204!==e&&202!==e?console.log("[SPOTIFY:NEXT] Error",e,o,t):log("[SPOTIFY] DONE_NEXT")});break;case"SPOTIFY_PREVIOUS":this.spotify.previous((e,o,t)=>{204!==e&&202!==e?console.log("[SPOTIFY:PREVIOUS] Error",e,o,t):log("[SPOTIFY] DONE_PREVIOUS")});break;case"SPOTIFY_SHUFFLE":this.spotify.shuffle(o,(e,o,t)=>{204!==e&&202!==e?console.log("[SPOTIFY:SHUFFLE] Error",e,o,t):log("[SPOTIFY] DONE_SHUFFLE")});break;case"SPOTIFY_REPEAT":this.spotify.repeat(o,(e,o,t)=>{204!==e&&202!==e?console.log("[SPOTIFY:REPEAT] Error",e,o,t):log("[SPOTIFY] DONE_REPEAT")});break;case"SEARCH_AND_PLAY":log("[SPOTIFY] Search and Play",o),this.searchAndPlay(o.query,o.condition)}},initialize:async function(e){this.config=e,1==(!!this.config.debug&&this.config.debug)&&(log=_log),this.config.useA2D?(this.addons(),console.log("[A2D] Assistant2Display is initialized.")):console.log("[A2D] Assistant2Display is disabled.")},callback:function(e,o){e&&this.sendSocketNotification(e,o)},setVolume:function(e){var o=this.config.volumeScript.replace("#VOLUME#",e);exec(o,(o,t,i)=>{o?console.log("[A2D:VOLUME] Set Volume Error:",o):log("[VOLUME] Set Volume To:",e)})},pm2Restart:function(e){exec("pm2 restart "+e,(o,t,i)=>{o?console.log("[A2D:PM2] "+o):log("[PM2] Restart",e)})},addons:function(){var e={sendSocketNotification:(e,o)=>{this.sendSocketNotification(e,o)},screen:e=>{this.screen&&"WAKEUP"==e&&this.screen.wakeup()},governor:e=>{this.governor&&"GOVERNOR_SLEEPING"==e&&this.governor.sleeping(),this.governor&&"GOVERNOR_WORKING"==e&&this.governor.working()},pir:e=>{this.screen&&this.pir&&"PIR_DETECTED"==e&&this.screen.wakeup()}};if(this.config.screen.useScreen&&(this.screen=new Screen(this.config.screen,e.sendSocketNotification,this.config.debug,e.sendSocketNotification,e.governor),this.screen.activate()),this.config.pir.usePir&&(this.pir=new Pir(this.config.pir,e.pir,this.config.debug),this.pir.start()),this.config.governor.useGovernor&&(this.governor=new Governor(this.config.governor,null,this.config.debug),this.governor.start()),this.config.internet.useInternet&&(this.internet=new Internet(this.config.internet,e.sendSocketNotification,this.config.debug),this.internet.start()),this.config.cast.useCast&&(this.cast=new CastServer(this.config.cast,e.sendSocketNotification,this.config.debug),this.cast.start()),this.config.spotify.useSpotify&&(this.spotify=new Spotify(this.config.spotify,e.sendSocketNotification,this.config.debug),this.spotify.start(),this.config.spotify.useLibrespot&&(console.log("[SPOTIFY] Launch Librespot..."),this.librespot())),this.config.NPMCheck.useChecker){var o={dirName:__dirname,moduleName:this.name,timer:this.config.NPMCheck.delay,debug:this.config.debug};this.Checker=new npmCheck(o,e=>{this.sendSocketNotification("NPM_UPDATE",e)})}},librespot:function(){var e=path.resolve(__dirname,"components/librespot/target/release","librespot");if(!fs.existsSync(e))return console.log("[LIBRESPOT] librespot is not installed !");pm2.connect(o=>{if(o)return console.log(o);console.log("[PM2] Connected!"),pm2.list((o,t)=>{if(o)return console.log(o);if(t&&Object.keys(t).length>0)for(let[e,o]of Object.entries(t))if("librespot"==o.name&&o.pid)return console.log("[PM2] Librespot already launched");pm2.start({script:e,name:"librespot",out_file:"/dev/null",args:["-n",this.config.spotify.connectTo,"-u",this.config.spotify.username,"-p",this.config.spotify.password,"--initial-volume",this.config.spotify.maxVolume]},(e,o)=>{if(e)return console.log(e);console.log("[PM2] Librespot started !")})})}),process.on("exit",e=>{pm2.stop("librespot",(e,o)=>{console.log("[LIBRESPOT] Killed")})})},searchAndPlay:function(e,o){e.type?e.type=e.type.replace(/\s/g,""):e.type="artist,track,album,playlist",e.q||(e.q="something cool");var t=(e,o,t)=>{var i={},s=o?e[Math.floor(Math.random()*e.length)]:e[0];return s.uri?(i[t]="uris"==t?[s.uri]:s.uri,i):(console.log("[SPOTIFY] Unplayable item: ",s),!1)};this.spotify.search(e,(e,i,s)=>{var r=null;if(200==e){const e={tracks:"uris",artists:"context_uri",albums:"context_uri",playlists:"context_uri"};for(var n in e)if(e.hasOwnProperty(n)&&!r){var c=e[n];s[n]&&s[n].items.length>1&&(r=t(s[n].items,o.random,c))}r&&o.autoplay?(log("[SPOTIFY] Search and Play Result:",r),this.socketNotificationReceived("SPOTIFY_PLAY",r)):log("[SPOTIFY] Search and Play No Result")}else console.log("[A2D] [SPOTIFY] Search and Play failed !")})}});
