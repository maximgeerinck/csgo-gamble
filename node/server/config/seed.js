/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/user/user.model')
  , Bot = require('../api/bot/bot.model')
  , Item = require('../api/item/item.model')
  , Trade = require('../api/trade/trade.model')
  , EventEmitter = require('events').EventEmitter
  , Lottery = require('../api/lottery/lottery.model');

var Seeder = function() {

  var self = this;
  EventEmitter.call(this);

  seedBot(function(bot) {
    seedUsers(function(users) {
      self.emit("seeded");
      //seedLottery(bot, [], function(){
      //  self.emit("seeded");
      //});

      //seedItems(function(items) {
      //  seedTrades(bot, users, items, function(trades) {
      //    seedLottery(bot, trades, function(lottery) {
      //      self.emit("seeded");
      //      console.log("Seed complete!");
      //    });
      //  });
      //});
    });
  });

};

function seedBot(callback) {
  Bot.find({}).remove(function() {
    Bot.create({
      accountName: "xlogiikzzo2",
      password: "ShutUpYoureNotNiceImAshley",
      addedOn: new Date(),
      lastLoginState: "Okay",
      authCode: "6JCQF",
      shaSentryfile: "sentry"
    }, function(err, bot) {
      if(err) { console.log("Error in seed bot: " + err); }
      callback(bot);
    });
  });
}
function seedUsers(callback) {
  User.find({}).remove(function() {
    User.collection.insert([
      {
        provider: "steam",
        username: "c4d3r",
        displayName: "c4d3r",
        steam : {
          personastateflags : 0,
          timecreated : 1291819258,
          primaryclanid : "103582791432632332",
          personastate : 0,
          avatarfull : "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/31/31466bfbfe84f6de72acab3334863ac0cceceef4_full.jpg",
          avatarmedium : "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/31/31466bfbfe84f6de72acab3334863ac0cceceef4_medium.jpg",
          avatar : "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/31/31466bfbfe84f6de72acab3334863ac0cceceef4.jpg",
          profileurl : "http://steamcommunity.com/profiles/76561198034757244/",
          lastlogoff : 1430044278,
          personaname : "c4d3r",
          profilestate : 1,
          communityvisibilitystate : 3,
          steamid : "76561198034757244"
        },
        role : "user"
      }
      //{
      //  provider: "steam",
      //  username: "dummy2",
      //  displayName: "dummy2",
      //  steam : {
      //    personastateflags : 0,
      //    timecreated : 1291819258,
      //    primaryclanid : "103582791432632332",
      //    personastate : 0,
      //    avatarfull : "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/31/31466bfbfe84f6de72acab3334863ac0cceceef4_full.jpg",
      //    avatarmedium : "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/31/31466bfbfe84f6de72acab3334863ac0cceceef4_medium.jpg",
      //    avatar : "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/31/31466bfbfe84f6de72acab3334863ac0cceceef4.jpg",
      //    profileurl : "http://steamcommunity.com/profiles/76561198034757244/",
      //    lastlogoff : 1430044278,
      //    personaname : "c4d3r",
      //    profilestate : 1,
      //    communityvisibilitystate : 3,
      //    steamid : "765611980347572448"
      //  },
      //  role : "user"
      //}
    ], function(err, users) {
        if(err) { console.log("Error in seed users: " + err); }
        callback(users);
      }
    );
  });
}

function seedTrades(bot, users, items, callback) {
  Trade.find({}).remove(function() {
    Trade.collection.insert([
      {
        issuedBy: users[0]._id,
        bot: bot._id,
        items: [
          {price: 9.99, item: items[0]._id},
          {price: 123.02, item: items[1]._id}
        ],
        steamTradeId: "FEUDPF55FEDS8WQ"
      },
      {
        issuedBy: users[1]._id,
        //bot: bot,
        items: [
          {price: 64.24, item: items[2]._id}
        ],
        steamTradeId: "QQEOROTSFJ89GG"
      }
    ], function(err, trades) {
        if(err) { console.log("Error in seed trades: " + err); }
        callback(trades);
      }
    );
  });
}

function seedLottery(bot, trades, callback) {
  Lottery.find({}).remove(function() {
    Lottery.create({
      trades: trades,
      startedOn: new Date(),
      active: true,
      itemsKept: [],
      itemsAwarded: [],
      bot: bot
    }, function(err, lottery) {
      if(err){ console.log(err); }
      callback(lottery);
    });
  });
}

function seedItems(callback) {
  Item.find({}).remove(function () {
    Item.collection.insert([
      {
        "appId": "730",
        "classId": "310776668",
        "data": {
          "icon_url": "fWFc82js0fmoRAP-qOIPu5THSWqfSmTELLqcUywGkijVjZYMUrsm1j-9xgEObwgfEh_nvjlWhNzZCveCDfIBj98xqodQ2CZknz52JLSKIydYYRTQALlhXec37TfhDCM7_cotV4bm8-MAegW5sYrBO7h4N91LSpPXX6OBbgGuuEkxh_UPesbb9irmiDOpZDk4vt3t4Q",
          "icon_url_large": "fWFc82js0fmoRAP-qOIPu5THSWqfSmTELLqcUywGkijVjZYMUrsm1j-9xgEObwgfEh_nvjlWhNzZCveCDfIBj98xqodQ2CZknz52JLSKIydYYRTQALlhXec37TfhDCM7_cpcWNak8L5IKg3v4IqQMLl6NdBLF8iEXfOBM1r67x4_iKkOfZeAp369iH67bG4DDg2rpDxPKdotVQ",
          "icon_drag_url": "",
          "name": "MP7 | Army Recon",
          "market_hash_name": "MP7 | Army Recon (Field-Tested)",
          "market_name": "MP7 | Army Recon (Field-Tested)",
          "name_color": "D2D2D2",
          "background_color": "",
          "type": "Consumer Grade SMG",
          "tradable": 1,
          "marketable": 1,
          "commodity": 0,
          "fraudwarnings": "",
          "descriptions": {
            "0": {
              "type": "html",
              "value": "Exterior: Field-Tested",
              "app_data": ""
            },
            "1": {
              "type": "html",
              "value": " ",
              "app_data": ""
            },
            "2": {
              "type": "html",
              "value": "Versatile but expensive, the German-made MP7 SMG is the perfect choice for high-impact close-range combat. It has been spray-painted freehand with short, thick lines in contrasting colors.\n\n<i>Perfect for the insurgent on the go</i>",
              "app_data": ""
            },
            "3": {
              "type": "html",
              "value": " ",
              "app_data": ""
            },
            "4": {
              "type": "html",
              "value": "The Safehouse Collection",
              "color": "9da1a9",
              "app_data": {
                "def_index": "65535",
                "is_itemset_name": "1"
              }
            },
            "5": {
              "type": "html",
              "value": " ",
              "app_data": ""
            }
          },
          "owner_descriptions": "",
          "market_actions": {
            "0": {
              "name": "Inspect in Game...",
              "link": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20M%listingid%A%assetid%D14727552168230915139"
            }
          },
          "tags": {
            "0": {
              "internal_name": "CSGO_Type_SMG",
              "name": "SMG",
              "category": "Type",
              "category_name": "Type"
            },
            "1": {
              "internal_name": "weapon_mp7",
              "name": "MP7",
              "category": "Weapon",
              "category_name": "Weapon"
            },
            "2": {
              "internal_name": "set_safehouse",
              "name": "The Safehouse Collection",
              "category": "ItemSet",
              "category_name": "Collection"
            },
            "3": {
              "internal_name": "normal",
              "name": "Normal",
              "category": "Quality",
              "category_name": "Category"
            },
            "4": {
              "internal_name": "Rarity_Common_Weapon",
              "name": "Consumer Grade",
              "category": "Rarity",
              "color": "b0c3d9",
              "category_name": "Quality"
            },
            "5": {
              "internal_name": "WearCategory2",
              "name": "Field-Tested",
              "category": "Exterior",
              "category_name": "Exterior"
            }
          }
        }
      },
      {
        "appId": "730",
        "classId": "527635071",
        "data": {
          "icon_url": "fWFc82js0fmoRAP-qOIPu5THSWqfSmTELLqcUywGkijVjZYMUrsm1j-9xgEObwgfEgznuShMhvflDOGJG68Didsh4K9QyiZkgxVoC7HlYWNYYRHPDKVMEvBvo1HpWiFl68YzBIOw8-IEfA2-5YKQNrkrNdFMTMnTXKTUb1_77RgmwP8Kbnkd6Qw",
          "icon_url_large": "",
          "icon_drag_url": "",
          "name": "eSports 2014 Summer Case",
          "market_hash_name": "eSports 2014 Summer Case",
          "market_name": "eSports 2014 Summer Case",
          "name_color": "D2D2D2",
          "background_color": "",
          "type": "Base Grade Container",
          "tradable": 1,
          "marketable": 1,
          "commodity": 1,
          "fraudwarnings": "",
          "descriptions": {
            "0": {
              "type": "html",
              "value": "A portion of the proceeds from the key used to unlock this will help support CS:GO professional tournament prize pools.",
              "app_data": ""
            },
            "1": {
              "type": "html",
              "value": " ",
              "app_data": ""
            },
            "2": {
              "type": "html",
              "value": "Container Series #19",
              "app_data": ""
            },
            "3": {
              "type": "html",
              "value": " ",
              "app_data": ""
            },
            "4": {
              "type": "html",
              "value": "Contains one of the following:",
              "app_data": ""
            },
            "5": {
              "type": "html",
              "value": "SSG 08 | Dark Water",
              "app_data": ""
            }
          },
          "owner_descriptions": "",
          "tags": {
            "0": {
              "internal_name": "CSGO_Type_WeaponCase",
              "name": "Container",
              "category": "Type",
              "category_name": "Type"
            },
            "1": {
              "internal_name": "set_esports_iii",
              "name": "The eSports 2014 Summer Collection",
              "category": "ItemSet",
              "category_name": "Collection"
            },
            "2": {
              "internal_name": "normal",
              "name": "Normal",
              "category": "Quality",
              "category_name": "Category"
            },
            "3": {
              "internal_name": "Rarity_Common",
              "name": "Base Grade",
              "category": "Rarity",
              "category_name": "Quality"
            }
          }
        }
      },
      {
        "appId": "730",
        "classId": "720305792",
        "data": {
          "icon_url": "fWFc82js0fmoRAP-qOIPu5THSWqfSmTELLqcUywGkijVjZYMUrsm1j-9xgEObwgfEh_nvjlWhNzZCveCDfIBj98xqodQ2CZknz5jObLlYWNYcxX9Ga0PDKRuyxvlDisz18tqU9-iuexXKg3ntNGSMOIkYowZTseEWqSHZwCsuElqifVYK5KAonnq3H_qaz8UG028V1T_FHk",
          "icon_url_large": "fWFc82js0fmoRAP-qOIPu5THSWqfSmTELLqcUywGkijVjZYMUrsm1j-9xgEObwgfEh_nvjlWhNzZCveCDfIBj98xqodQ2CZknz5jObLlYWNYcxX9Ga0PDKRuyxvlDisz18tqU9-iyLcHO1u6qoXHYLEkMIsYHJLYCKLTNw6p6hk5gagMfZfbqX7q2SrgOD0PWkHoqzoa2LjQ78kjYhs",
          "icon_drag_url": "",
          "name": "XM1014 | Quicksilver",
          "market_hash_name": "XM1014 | Quicksilver (Minimal Wear)",
          "market_name": "XM1014 | Quicksilver (Minimal Wear)",
          "name_color": "D2D2D2",
          "background_color": "",
          "type": "Mil-Spec Grade Shotgun",
          "tradable": 1,
          "marketable": 1,
          "commodity": 0,
          "fraudwarnings": "",
          "descriptions": {
            "0": {
              "type": "html",
              "value": "Exterior: Minimal Wear",
              "app_data": ""
            },
            "1": {
              "type": "html",
              "value": " ",
              "app_data": ""
            },
            "2": {
              "type": "html",
              "value": "The XM1014 is a powerful fully automatic shotgun that justifies its heftier price tag with the ability to paint a room with lead fast. It has been painted using a translucent hydrographic with a terrain map motif over metallic silver paint.\n\n<i>Sometimes you need an unstable element to solve your problems - Kotaro Izaki, Breach Expert</i>",
              "app_data": ""
            },
            "3": {
              "type": "html",
              "value": " ",
              "app_data": ""
            },
            "4": {
              "type": "html",
              "value": "The Chroma Collection",
              "color": "9da1a9",
              "app_data": {
                "def_index": "65535",
                "is_itemset_name": "1"
              }
            },
            "5": {
              "type": "html",
              "value": " ",
              "app_data": ""
            }
          },
          "owner_descriptions": "",
          "market_actions": {
            "0": {
              "name": "Inspect in Game...",
              "link": "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20M%listingid%A%assetid%D6982522010476336847"
            }
          },
          "tags": {
            "0": {
              "internal_name": "CSGO_Type_Shotgun",
              "name": "Shotgun",
              "category": "Type",
              "category_name": "Type"
            },
            "1": {
              "internal_name": "weapon_xm1014",
              "name": "XM1014",
              "category": "Weapon",
              "category_name": "Weapon"
            },
            "2": {
              "internal_name": "set_community_6",
              "name": "The Chroma Collection",
              "category": "ItemSet",
              "category_name": "Collection"
            },
            "3": {
              "internal_name": "normal",
              "name": "Normal",
              "category": "Quality",
              "category_name": "Category"
            },
            "4": {
              "internal_name": "Rarity_Rare_Weapon",
              "name": "Mil-Spec Grade",
              "category": "Rarity",
              "color": "4b69ff",
              "category_name": "Quality"
            },
            "5": {
              "internal_name": "WearCategory1",
              "name": "Minimal Wear",
              "category": "Exterior",
              "category_name": "Exterior"
            }
          }
        }
      }],
      function (err, items) {
        if(err) { console.log(err); }
        callback(items);
      });
  });
}

require('util').inherits(Seeder, EventEmitter);

module.exports.Seeder = Seeder;
