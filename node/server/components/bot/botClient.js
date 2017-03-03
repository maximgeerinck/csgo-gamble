/**
 * Created by Maxim on 13/05/2015.
 */
var botClient = module.exports = new BotClient;

//TEST
var Steam = require('steam')
    , SteamTradeOffers = require('steam-tradeoffers')
    , offersAPI = new SteamTradeOffers()
    , Bot = require("../../api/bot/bot.model.js")
    , Trade = require("../../api/trade/trade.model.js")
    , Item = require("../../api/item/item.model.js")
    , Lottery = require("../../api/lottery/lottery.model.js")
    , User = require("../../api/user/user.model.js")
    , steamClient = new Steam.SteamClient()
    , steamWebLib = require('steam-web')
    , async = require('async')
    , config = require('../../config/environment')
    , util = require('util');

var LotteryRepository = require('../../api/lottery/lottery.repository.js');

var steamWeb = new steamWebLib({
    apiKey: config.steam.apiKey,
    format: 'json' //optional ['json', 'xml', 'vdf']
});

function BotClient() {
    require('events').EventEmitter.call(this);
    this._model = {};
}

/**
 * Gets the price for an item using the marketHashName, asynchronous
 * @param marketHashName
 * @param callback
 */
BotClient.prototype.getPrice = function (marketHashName, callback) {
    //  success: true,
//    lowest_price: "0,03&#8364; ",
//    volume: "3,408",
//    median_price: "0,03&#8364; "
//}
    var url = "http://steamcommunity.com/market/priceoverview/?currency=3&appid=730&market_hash_name=" + marketHashName;
    var http = require("http");
    http.get(url, function (res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var response = JSON.parse(body)
            var price = response.lowest_price.replace("&#8364; ", "").replace(",", ".");
            callback(parseFloat(price));
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
};

/**
 * Starts a bot
 */
BotClient.prototype.start = function () {

    var self = this;

    // enable bot
    Bot.findOne({accountName: 'xlogiikzzo2'}, function (err, bot) {

        self._model = bot;

        if (!bot) {
            console.log("Could not find bot");
            return;
        }

        var logOnOptions = {
            accountName: bot.accountName,
            password: bot.password
        };

        if (require('fs').existsSync('sentry')) {
            logOnOptions['shaSentryfile'] = require('fs').readFileSync(bot.shaSentryfile);
        } else if (authCode != '') {
            logOnOptions['authCode'] = bot.authCode;
        }

        //trade offer link: https://steamcommunity.com/tradeoffer/new/?partner=166216092&token=xN4pQeXz
        //trade offer c4d3r: https://steamcommunity.com/tradeoffer/new/?partner=74491516&token=KxPbAK74
        //TODO: Handle error codes on logon
        //https://github.com/SteamRE/SteamKit/blob/master/Resources/SteamLanguage/eresult.steamd
        //for example: When bot is banned
        steamClient.logOn(logOnOptions);

    });

    steamClient.on('loggedOn', function (result) {
        console.log('Logged in!');
        steamClient.setPersonaName("Trade me!");
        steamClient.setPersonaState(Steam.EPersonaState.Online);
    });

    steamClient.on('webSessionID', function (sessionID) {
        console.log("Session ID: " + sessionID);

        steamClient.webLogOn(function (newCookie) {
            offersAPI.setup({
                sessionID: sessionID,
                webCookie: newCookie
            }, function(err) {
              if(err) {
                throw err;
              }

              //// --- DEBUG ---
              //LotteryRepository.findActivePopulated(function(lottery){
              //  lottery.end(function(lottery){
              //
              //    // determine winner and award winnings
              //    self.determineWinner(lottery, function(winner, winChance) {
              //      lottery.setWinner(winner, winChance, function(err, lottery){
              //        console.log("winner set");
              //      });
              //    });
              //
              //    //debug
              //    Lottery.create({
              //      bot: "55537e9cb6076be41d80387b",
              //      itemsAwarded: [],
              //      itemsKept: [],
              //      active: true,
              //      startedOn: new Date(),
              //      trades: [
              //        '55807bf9b6f0b7480f7d51b8',
              //        '5581a5ed158840442a3e83a5',
              //        '55846b6540fd35dc3db3bdc3'
              //      ]
              //    });
              //
              //  });
              //});
              //// --- END DEBUG ---
            });
        });
    });

    steamClient.on('sentry', function (data) {
        console.log("Writing new sentry file");
        require('fs').writeFileSync('sentry', data);
    });

    steamClient.on('tradeOffers', function (number) {

        if (number <= 0) {
            return; //no trade offers received
        }

        //get trade offers call
        offersAPI.getOffers({
            get_received_offers: 1,
            active_only: 1,
            time_historical_cutoff: Math.round(Date.now() / 1000)
        }, function (error, body) {

            if (!body.response.trade_offers_received || body.response.trade_offers_received.length <= 0) {
                return;
            }

            //got trade offer
            console.log("Trade offers received");

            // FIND USER WHO DEPOSITED, body.steamid_other
            User.findOne({'steam.steamid': body.response.trade_offers_received[0].steamid_other}, function (err, user) {

                var tradeOffers = [];

                async.each(body.response.trade_offers_received, function (offer, tradeOfferReceivedCallback) {

                    //create trade
                    var trade = {
                        issuedBy: user._id,
                        bot: self._model._id,
                        steamTradeId: null,
                        items: []
                    };

                    //offer must has state 2
                    if (offer["trade_offer_state"] != 2) {
                        return;
                    }

                    //check items, if not exist -> create
                    var classIds = [], itemsReceived = {}, items = [], totalPrice = 0;

                    //steam trade id
                    trade.steamTradeId = offer.tradeofferid;

                    //get items to receive
                    offer["items_to_receive"].forEach(function (item) {
                        classIds.push(item["classid"]);
                        itemsReceived[item["classid"]] = item;
                    });

                    //get items amd add to DB if not exist
                    steamWeb.getAssetClassInfo({
                        appid: 730, //CS:GO
                        classIds: classIds,
                        callback: function (err, data) {

                            classIds.forEach(function (classId) {
                                //get price
                                items.push({
                                    appId: 730,
                                    contextId: itemsReceived[classId].contextid,
                                    assetId: itemsReceived[classId].assetid,
                                    classId: classId,
                                    instanceId: itemsReceived[classId].instanceid,
                                    icon_url: data["result"][classId].icon_url,
                                    icon_url_large: data["result"][classId].icon_url_large,
                                    icon_drag_url: data["result"][classId].icon_drag_url,
                                    name: data["result"][classId].name,
                                    market_hash_name: data["result"][classId].market_hash_name,
                                    market_name: data["result"][classId].market_name,
                                    name_color: data["result"][classId].name_color,
                                    background_color: data["result"][classId].background_color,
                                    type: data["result"][classId].type,
                                    tradable: data["result"][classId].tradable,
                                    marketable: data["result"][classId].marketable,
                                    commodity: data["result"][classId].commodity,
                                    fraudwarnings: data["result"][classId].fraudwarnings,
                                    descriptions: data["result"][classId].descriptions,
                                    owner_descriptions: data["result"][classId].owner_descriptions,
                                    market_actions: data["result"][classId].market_actions,
                                    tags: data["result"][classId].tags,
                                });
                            });

                            //insert items, get prices afterwards and add to trade offer
                            Item.collection.insertMany(items, function (err, items) {
                                if(err) {
                                    console.log("Error detected while inserting items: " + err);
                                    tradeOfferReceivedCallback();
                                }

                                if(!util.isArray(items)) {
                                    items = [items];
                                }

                                async.each(items[0].ops, function(item, itemInsertCallback){
                                    self.getPrice(item.market_hash_name, function(price){
                                        price = price;
                                        trade["items"].push({price: price, item: item});
                                        totalPrice += price;
                                        itemInsertCallback();
                                    });
                                }, function(err) {
                                    if(err) {
                                        console.log("Error in item insertion async: " + err);
                                        return;
                                    }

                                    // error in steam API
                                    if (data != null && data.length >= 1 && data[0].indexOf("please try again later.") >= 0) {
                                        self.handleSteamError(data[0].match(/\(\d+\)/g).replace("(", "").replace(")", ""));
                                        //return false; //TODO: Activate later, for now we ignore errors so we can do something
                                    }

                                    tradeOffers.push({"totalPrice": totalPrice, "data": trade});
                                    tradeOfferReceivedCallback();

                                });//end async
                            }); //end item collection insert
                        }
                    }); //end assetclassinfo
                }, function (err) {

                    if(err) {
                        console.log("An error occurred in trade offer iterator: " + err);
                        return;
                    }
                    async.each(tradeOffers, function(tradeOffer, callback){

                        //TODO: Make 10 configurable
                        if (tradeOffer.totalPrice < 10) {
                            offersAPI.declineOffer({tradeOfferId: tradeOffer.data.steamTradeId}, function (data) {
                                console.log("Declined offer, price: " + tradeOffer.totalPrice);
                                self.declineOffer(tradeOffer);
                                callback();
                            }); //end declineOffer
                        } else {
                            offersAPI.acceptOffer({tradeOfferId: tradeOffer.data.steamTradeId}, function (data) {
                                console.log("Accepted offer, price: " + tradeOffer.totalPrice);
                                self.acceptOffer(tradeOffer);
                                callback();
                            }); //end acceptOffer
                        }

                    });//end trade offer async
                }); //end trade offer received foreach
            }); //end user find
        });
    });
};

/**
 * Accepts a tradeoffer and inserts it in the database
 * @param tradeOffer
 */
BotClient.prototype.acceptOffer = function(tradeOffer) {
  var self = this;
    // create trade
    console.log("--- CREATING TRADE ---");

  LotteryRepository.findActive(function(lottery){

    tradeOffer.data._lottery = lottery._id;
    Trade.create(tradeOffer.data, function (err, trade) {
      console.log("Trade verified and created!");

      lottery.addTrade(trade);
      lottery.save(function (err, lottery) {
        if (err) {
          console.log("Could not add trade to active lottery")
        }

        LotteryRepository.findActivePopulated(function(lottery){

          // get total items in the lottery
          var items = [];
          for(var i = 0; i < lottery.trades.length; i++) {
            for(var j = 0; j < lottery.trades[i].items.length; j++) {
              items.push(lottery.trades[i].items[j].item);
            }
          }

          // lottery ended?
          if(items.length >= 50) {
            console.log("Lottery filled! Waiting for end...");
            self.endLottery(lottery);
          } else {
            console.log("Lottery not filled yet: " + items.length);
          }
        });
      });
    });
  });
};

/**
 * Ends a lottery
 * @param lottery
 */
BotClient.prototype.endLottery = function(lottery) {
  var self = this;

  // award winnings and start new lottery meanwhile
  lottery.end(function(lottery){

    // determine winner and award winnings
    self.determineWinner(lottery, function(winner, winChance) {
      lottery.setWinner(winner, winChance, function(err, lottery){
        self.awardWinnings(lottery, winner);
      });
    });

    // start new lottery
    self.startNewLottery();
  });
};

/**
 * Starts a new lottery
 * @param callback, callback function with the new lottery object as parameter (non-populated)
 */
BotClient.prototype.startNewLottery = function(callback) {

  //TODO: set bot
  Lottery
    .create({active: true, trades: []}, function(err, lottery){
      if(typeof callback != "undefined") {
        callback(lottery);
      }
    });
};
/**
 * declines a tradeoffer
 * @param tradeOffer
 */
BotClient.prototype.declineOffer = function(tradeOffer) {
    // price smaller than 10
    //TODO: Notify user that his trade is declined because of the item price count
    console.log("Trade declined: Price is smaller than min 10$, counted: " + tradeOffer.totalPrice);
};

/**
 * Handles the most frequently discovered steam error codes
 * @param errorCode
 */
BotClient.prototype.handleSteamError = function (errorCode) {
    switch (errorCode) {
        case 2:
            console.log("Time out");
            break;
        case 8:
            console.log("Missing Parameters.");
            console.log("Possible causes:\nYou're using an outdated client and the secure cookie is missing.");
            break;
        case 11:
            console.log("Time out"); //often OK
            break;
        case 15:
            console.log("Trade partner's inventory is full OR Access token for tradeurl is necessary and was not provided");
            break;
        case 16:
            console.log("Time out"); //often OK
            break;
        case 24:
            console.log("Insufficient Privileges");
            console.log("Possible causes:");
            console.log("You have logged into a new device and you are not able to trade for x amount of days.");
            console.log("Your session cookie is invalid. Logoff and log back in.");
            break;
        case 26:
            console.log("Trade partner's inventory is full");
            break;
        case 28:
            console.log("Items no longer available or unable to check if the item is still available.");
            console.log("Possible causes:\nThe items became unavailable after you opened the trade offer window.\nItem server is dead and unable to check if the item still exists.");
            break;
        case 42:
            console.log("Timeout");
            break;
        case 46:
            console.log("Trade partner's inventory is full");
            break;
        default:
            console.log("Error occurred!");
    }
};

/**
 * Determines the winner of a lottery
 * @param lottery, the lottery where the winner should be determined
 * @param callback, the callback function giving back the winner
 */
BotClient.prototype.determineWinner = function(lottery, callback) {

  var self = this, items = 0, totalPrice = 0, maxItems = 0;

  // lottery validation
  if(typeof lottery == "undefined" || lottery == null) {
    console.log("Lottery was undefined!");
    return;
  }

  // get deposited prices
  LotteryRepository.findDepositsPerUser(lottery, function(pricesDeposited, items){

    //TODO: Make configurable
    //Algorithm to choose a winner
    if(items >= maxItems) {

      // determine amount of total tickets
      var totalTickets = 0;
      for(var i = 0; i < pricesDeposited.length; i++) {
        totalTickets += parseInt(pricesDeposited[i].price);
      }
      console.log("Awarding total of %d tickets", totalTickets);

      // determine winning ticket
      var winningTicket = randomInt(1, totalTickets);
      console.log("Winning ticket: #%d", winningTicket);

      //award ticket
      var currentPrice = 0, length = pricesDeposited.length, winChance;
      for(var counter = 0; counter < length; counter++) {
        // debug: console.log("check %d between %d and %d", winningTicket, currentPrice, (currentPrice + parseInt(pricesDeposited[i].price)));
        if (winningTicket >= currentPrice && winningTicket < (currentPrice + parseInt(pricesDeposited[counter].price))) {
          winChance = (parseInt(pricesDeposited[counter].price) / totalTickets * 100);
          console.log(pricesDeposited[counter].user._id + " won with a chance of: %d\%", winChance);
          //self.awardWinnings(lottery, totalPrice, pricesDeposited[counter].user, (pricesDeposited[counter].price / totalTickets * 100));
          Lottery.update(lottery, {winChance: winChance});

          if(typeof callback != "undefined") {
            callback(pricesDeposited[counter].user, winChance);
          }

          return;
        }
        currentPrice += parseInt(pricesDeposited[counter].price);
      }

      console.log("Couldn't determine winner in lottery with id: %s", lottery._id);
    } else {
      console.log("Jackpot doesn't contain %d items yet, contains: %d", maxItems, items);
    }

  });

};

/**
 * Award the winnings of a lottery to a given user
 * @param lottery
 */
BotClient.prototype.awardWinnings = function(lottery) {

  console.log("Awarding winnings to user with id: %s", lottery.winner._id);

  // get 5% of total price, TODO: Make configurable
  var keepPrice = 0, totalPrice = 0, keepItems = [], totalKeepingPrice = 0, i;

  lottery.retrieveItemsWithPrice(function(items) {

    // determine keep price
    for(i = 0; i < items.length; i++) {
      totalPrice += items[i].price;
    }
    keepPrice = totalPrice * 0.05;
    console.log("Keeping skins with a value around: %d", keepPrice);

    // determine items to keep
    for(i = items.length - 1; i >= 0; i--) {
      if(items[i].price <= keepPrice && totalKeepingPrice + items[i].price < keepPrice) { //if item price is smaller AND totalPrice does not exceed
        totalKeepingPrice += items[i].price;
        keepItems.push(items[i]);
        items.splice(i, 1); //remove kept item from array
      }
    }

    // if keep item array is empty, take cheapest skin
    if(keepItems.length == 0) {
      totalKeepingPrice += items[0].price;
      keepItems.push(items[0]);
      items.splice(0, 1);
    }

    console.log("Keeping %d items with a value of %d", keepItems.length, totalKeepingPrice);

    // make compatible with offerAPI, TODO: Adapter pattern
    var itemsToAward = [];

    // load the inventory, get the new assetids for the items with classId...
    offersAPI.loadMyInventory({
      appId: 730,
      contextId: 2
    }, function(err, inventoryItems){

      for(var i = 0; i < inventoryItems.length; i++) {
        for(var j = 0; j < items.length; j++) {

          if(inventoryItems[i].classid == items[j].classId && inventoryItems[i].tradable) {
            itemsToAward.push({
              appid: inventoryItems[j].appid,
              contextid: 2,
              amount: 1,
              assetid: inventoryItems[j].id
            });
            break;
          }
        }
      }

      if(itemsToAward.length > 0) {
        offersAPI.makeOffer({
          partnerSteamId: lottery.winner.steam.steamid,
          itemsFromMe: itemsToAward,
          itemsFromThem: [],
          message: 'Your winnings!',
          accessToken: lottery.winner.accessToken
        }, function(err, response) {
          if(err) {
            console.log("An error occurred during item awarding to user: %s", err);
          } else {
            console.log(response);
            console.log("Items were given to user");

            lottery.itemsKept = keepItems;
            lottery.itemsAwarded = items;
            lottery.tradeOfferId = response.tradeofferid;
            lottery.save();
          }
        });
      }


      if(err) { console.log("Failed to end lottery!"); }
    });
  });
};

/**
 * Empties the inventory of a bot and makes a tradeoffer to the specified partner
 * @param pSteamId, the partner steam id who should receive the contents of the inventory
 * @param accessToken, the access token of the partner
 */
BotClient.prototype.emptyInventory = function(pSteamId, accessToken) {
  //TEST giving everything back
  offersAPI.loadMyInventory({
    appId: 730,
    contextId: 2
  }, function (err, items) {

    var item;
    var is = [];
    //get all tradable items
    for (var i = 0; i < items.length; i++) {
      if (items[i].tradable) {
        is.push({
          appid: 730,
          contextid: 2,
          amount: 1,
          assetid: items[i].id
        });
      }
    }

    if (items.length > 0) {
      offersAPI.makeOffer({
        partnerSteamId: pSteamId,
        itemsFromMe: is,
        itemsFromThem: [],
        message: 'Emptying inventory of bot',
        accessToken: accessToken
      }, function (err, response) {
        if (err) {
          throw err;
        }
        console.log(response);
      })
    }
  });
};

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
