define(
    [
        'jquery',
        'api/analytics',
        'lib/mobile-detect'
    ],
    function (jQuery, Analytics, mobile) {
        var objImmerse = objImmerse || {};

        objImmerse.init = function () {
            objImmerse.arrHTMLTag = jQuery("html");
            objImmerse.arrPageContainer = jQuery(".page-container");
            objImmerse.arrPanelWindow = jQuery(".panel-window");
            objImmerse.arrVideos = jQuery("video");
            objImmerse.arrAudios = jQuery("audio");
            objImmerse.arrPanels = jQuery(".panel");
            objImmerse.arrAudioPlayButtons = jQuery(".audio-button");
            objImmerse.arrCheckButton = jQuery(".check-button");
            objImmerse.arrSpellingContainer = jQuery(".spelling-container");
            objImmerse.arrCorrect = jQuery(".correct");
            objImmerse.arrNextButton = jQuery(".next-button");
            objImmerse.arrSpellingForm = jQuery(".word-input");
            objImmerse.arrSpellingButton = jQuery(".spelling-button");
            objImmerse.arrSpellingSubmit = jQuery(".spelling-form");
            objImmerse.arrIntroButton = jQuery(".intro-button");
            objImmerse.arrIntro = jQuery(".intro-container");
            objImmerse.arrNumber = jQuery(".number-string");
            var blnIframeEmbed = window != window.parent;
            if ((jQuery.browser.mobile) && (!objImmerse.arrHTMLTag.hasClass("touch"))) {
                objImmerse.arrHTMLTag.addClass("touch");
            }
            if (blnIframeEmbed) {
                jQuery("#header").css({"display": "none"});
                jQuery(".section").css({"top": "10%"});
            }
            window.addEventListener("orientationchange", function () {
                objImmerse.reformatPage();
            }, false);
            onresize = onload = function () {
                objImmerse.reformatPage();
            };
            objImmerse.shuffleAnswers(objImmerse.arrWords);
            objImmerse.addEventListeners();
        };

        objImmerse.currentWord = 0;
        objImmerse.currentVideo = 0;
        objImmerse.currentAudio = 0;
        objImmerse.totalWords = 7;
        objImmerse.numCorrect = 0;
        objImmerse.numWindowWidth = window.innerWidth;
        objImmerse.arrWords = ["planet", "haven", "banjo", "nostalgia", "tussle", "molecule", "vineyard", "whey", "knead", "binoculars", "hydroponic", "appoggiatura", "autochthonous", "demarche", "guerdon", "knaidel", "laodicean", "pococurante", "prospicience", "stromuhr", "succedaneum", "ursprache"];

        objImmerse.reformatPage = function () {
            objImmerse.numWindowWidth = window.innerWidth;
            if (window.innerWidth / window.innerHeight < 1920 / 1080) {
                var numWidth = 100 * ((1920 / 1080) / (window.innerWidth / window.innerHeight));
                objImmerse.arrVideos.css({"width": numWidth.toString() + "%", "left": ((100 - numWidth) / 2).toString() + "%"});
            } else {
                objImmerse.arrVideos.css({"width": "100%", "left": "0%"});
            }
        };

        objImmerse.addEventListeners = function () {
            objImmerse.arrAudioPlayButtons.click(function (e) {
                var _this = jQuery(this);
                var intIndex = objImmerse.arrAudioPlayButtons.index(this);
                objImmerse.audioPlayClip(intIndex);
                Analytics.trackEvent("audioPlayed" + intIndex.toString());
            });

            objImmerse.arrIntroButton.click(function (e) {
                objImmerse.arrIntro.addClass("hide");
                objImmerse.arrSpellingContainer.removeClass("hide");
                objImmerse.setUpQuestion(0);
            });
            objImmerse.arrCheckButton.on("click", function (event) {
                objImmerse.checkAnswer();
                Analytics.trackEvent("checkAnswer" + objImmerse.currentWord.toString());
            });

            objImmerse.arrNextButton.on("click", function () {
                if (objImmerse.currentWord >= objImmerse.totalWords - 1) {
                    document.location.reload();
                } else {
                    objImmerse.setUpQuestion(objImmerse.currentWord + 1);
                }
                Analytics.trackEvent("NextButton" + objImmerse.currentWord.toString());
            });

            objImmerse.arrVideos[2].addEventListener("ended", function () {
                objImmerse.setVideos(1);
                objImmerse.arrNextButton.addClass("show");
                Analytics.trackEvent("videoCorrectComplete" + objImmerse.currentWord.toString());
            });

            objImmerse.arrVideos[3].addEventListener("ended", function () {
                objImmerse.setVideos(1);
                objImmerse.arrNextButton.addClass("show");
                Analytics.trackEvent("videoWrongComplete" + objImmerse.currentWord.toString());
            });
            objImmerse.arrAudios[4].addEventListener("ended", function () {
                objImmerse.resetAudioAnswer();
                Analytics.trackEvent("audioCorrectComplete" + objImmerse.currentWord.toString());
            });

            objImmerse.arrAudios[5].addEventListener("ended", function () {
                objImmerse.resetAudioAnswer();
                Analytics.trackEvent("audioWrongComplete" + objImmerse.currentWord.toString());
            });

            objImmerse.arrSpellingSubmit.submit(function (event) {
                event.preventDefault();
                objImmerse.arrCheckButton.trigger("click");
            });
            objImmerse.arrSpellingButton.click(function (e) {
                objImmerse.arrCorrect.find("h2").html(objImmerse.arrWords[objImmerse.currentWord]);
            });
            objImmerse.arrCorrect.find(".fbshare").click(function (e) {
                e.preventDefault();
                objImmerse.windowPopup(e.currentTarget.href, 500, 300);
            });
            objImmerse.arrCorrect.find(".tshare").click(function (e) {
                e.preventDefault();
                objImmerse.windowPopup(e.currentTarget.href, 500, 300);
            });
            objImmerse.setVideos(0);
        };

        objImmerse.setUpQuestion = function (intWord) {
            var arrSources = [];
            var strWordNum = "";
            objImmerse.setVideos(1);
            if (intWord >= objImmerse.totalWords) {
                intWord = 0;
                objImmerse.currentWord = 0;
            } else {
                objImmerse.currentWord = intWord;
            }
            jQuery.each(objImmerse.arrAudios, function (index) {
                arrSources = objImmerse.arrAudios.eq(index).find("source");
                switch (index) {
                    case 0:
                        jQuery.each(arrSources, function (sourceIndex) {
                            if (sourceIndex === 0) {
                                arrSources.eq(sourceIndex).attr({"src": "http://www.gannett-cdn.com/experiments/usatoday/2015/05/spelling-bee/media/audio/" + objImmerse.arrWords[intWord] + "-word.mp3", "type": "audio/mpeg"}).detach().appendTo(objImmerse.arrAudios.eq(index));
                            } else {
                                arrSources.eq(sourceIndex).attr({"src": "http://www.gannett-cdn.com/experiments/usatoday/2015/05/spelling-bee/media/audio/" + objImmerse.arrWords[intWord] + "-word.ogg", "type": "audio/ogg"}).detach().appendTo(objImmerse.arrAudios.eq(index));
                            }
                        });
                        objImmerse.arrAudios.eq(index).load();
                        break;
                    case 1:
                        jQuery.each(arrSources, function (sourceIndex) {
                            if (sourceIndex === 0) {
                                arrSources.eq(sourceIndex).attr({"src": "http://www.gannett-cdn.com/experiments/usatoday/2015/05/spelling-bee/media/audio/" + objImmerse.arrWords[intWord] + "-definition.mp3", "type": "audio/mpeg"}).detach().appendTo(objImmerse.arrAudios.eq(index));
                            } else {
                                arrSources.eq(sourceIndex).attr({"src": "http://www.gannett-cdn.com/experiments/usatoday/2015/05/spelling-bee/media/audio/" + objImmerse.arrWords[intWord] + "-definition.ogg", "type": "audio/ogg"}).detach().appendTo(objImmerse.arrAudios.eq(index));
                            }
                        });
                        objImmerse.arrAudios.eq(index).load();
                        break;
                    case 2:
                        jQuery.each(arrSources, function (sourceIndex) {
                            if (sourceIndex === 0) {
                                arrSources.eq(sourceIndex).attr({"src": "http://www.gannett-cdn.com/experiments/usatoday/2015/05/spelling-bee/media/audio/" + objImmerse.arrWords[intWord] + "-origin.mp3", "type": "audio/mpeg"}).detach().appendTo(objImmerse.arrAudios.eq(index));
                            } else {
                                arrSources.eq(sourceIndex).attr({"src": "http://www.gannett-cdn.com/experiments/usatoday/2015/05/spelling-bee/media/audio/" + objImmerse.arrWords[intWord] + "-origin.ogg", "type": "audio/ogg"}).detach().appendTo(objImmerse.arrAudios.eq(index));
                            }
                        });
                        objImmerse.arrAudios.eq(index).load();
                        break;
                    case 3:
                        jQuery.each(arrSources, function (sourceIndex) {
                            if (sourceIndex === 0) {
                                arrSources.eq(sourceIndex).attr({"src": "http://www.gannett-cdn.com/experiments/usatoday/2015/05/spelling-bee/media/audio/" + objImmerse.arrWords[intWord] + "-sentence.mp3", "type": "audio/mpeg"}).detach().appendTo(objImmerse.arrAudios.eq(index));
                            } else {
                                arrSources.eq(sourceIndex).attr({"src": "http://www.gannett-cdn.com/experiments/usatoday/2015/05/spelling-bee/media/audio/" + objImmerse.arrWords[intWord] + "-sentence.ogg", "type": "audio/ogg"}).detach().appendTo(objImmerse.arrAudios.eq(index));
                            }
                        });
                        objImmerse.arrAudios.eq(index).load();
                        break;
                }
            });
            switch (intWord) {
                case 0:
                    strWordNum = "first";
                    break;
                case 1:
                    strWordNum = "second";
                    break;
                case 2:
                    strWordNum = "third";
                    break;
                case 3:
                    strWordNum = "fourth";
                    break;
                case 4:
                    strWordNum = "fifth";
                    break;
                case 5:
                    strWordNum = "sixth";
                    break;
                case 6:
                    strWordNum = "seventh";
                    break;
            }
            objImmerse.arrNumber.html(strWordNum);
            objImmerse.arrSpellingForm[0].value = "";
            objImmerse.arrSpellingContainer.removeClass("hide");
            objImmerse.arrCorrect.addClass("hide");
        };

        objImmerse.checkAnswer = function () {
            var strShareHead, strShareChatter;
            var strTwitterURL = "http://usat.ly/1wiCb6B";
            var strPageURL = document.location.href;
            if (!objImmerse.arrAudios[objImmerse.currentAudio].paused) {
                objImmerse.arrAudios[objImmerse.currentAudio].pause();
            }
            if (strPageURL.indexOf("#") != -1) {
                strPageURL = strPageURL.substr(0, strPageURL.indexOf("#"));
            }
            if (objImmerse.arrWords[objImmerse.currentWord].toLowerCase() === objImmerse.arrSpellingForm[0].value.toLowerCase()) {
                objImmerse.arrCorrect.find("h2").html("Correct!");
                objImmerse.arrCorrect.removeClass("wrong");
                objImmerse.setVideos(2);
                strShareChatter = "I got it right! Think you could spell any of the words from previous National Spelling Bees?";
                objImmerse.numCorrect = objImmerse.numCorrect + 1;
            } else {
                objImmerse.arrCorrect.find("h2").html("Wrong!");
                objImmerse.arrCorrect.addClass("wrong");
                objImmerse.setVideos(3);
                strShareChatter = "This is hard! Think you could spell any of the words from previous National Spelling Bees?";
            }
            if (objImmerse.currentWord >= objImmerse.totalWords - 1) {
                objImmerse.arrCorrect.find("h2").after("<h3>You got " + objImmerse.numCorrect + " out of " + objImmerse.totalWords + " correct.</h3>");
                strShareChatter = "I got " + objImmerse.numCorrect + " out of " + objImmerse.totalWords + " correct on the 2015 USA TODAY Spelling Bee. Can you do better?";
                objImmerse.arrNextButton.html("Start Over");
            }
            //objImmerse.arrNextButton.removeClass("show");
            strShareHead = "Winning Words";
            strShareHead = strShareHead.replace(/'/gi, "\\'");
            strShareChatter = strShareChatter.replace(/'/gi, "\\'");
            objImmerse.arrCorrect.find(".fbshare").attr({"href": "https://www.facebook.com/dialog/feed?display=popup&app_id=215046668549694&link=" + encodeURIComponent(strPageURL) + "&picture=" + strPageURL.substr(0, strPageURL.lastIndexOf("/") + 1) + "img/fb-post.jpg&name=" + encodeURIComponent(strShareHead) + "&description=" + encodeURIComponent(strShareChatter) + "&redirect_uri=http://" + window.location.hostname + "/pages/interactives/fb-share/"});
            objImmerse.arrCorrect.find(".tshare").attr({"href": "https://twitter.com/intent/tweet?url=" + encodeURIComponent(strTwitterURL) + "&text=" + encodeURIComponent(strShareChatter) + "&via=usatoday"});
            objImmerse.arrCorrect.find(".eshare").attr({"href": "mailto:?body=" + strShareChatter + " %0d%0d " + encodeURIComponent(strPageURL) + "&subject=" + strShareHead});
            objImmerse.arrSpellingContainer.addClass("hide");
            objImmerse.arrCorrect.removeClass("hide");
        };

        objImmerse.audioPlayClip = function (intAudio) {
            if (!objImmerse.arrAudios[objImmerse.currentAudio].paused) {
                objImmerse.arrAudios[objImmerse.currentAudio].pause();
            }
            //if ((Modernizr.touch) || (jQuery.browser.mobile)) {
            objImmerse.arrAudios[intAudio].load();
            //}
            objImmerse.arrAudios[intAudio].play();
            objImmerse.currentAudio = intAudio;
        };

        objImmerse.setVideos = function (intVideo) {
            if (!jQuery.browser.mobile) {
                if (!objImmerse.arrVideos[objImmerse.currentVideo].paused) {
                    objImmerse.arrVideos[objImmerse.currentVideo].pause();
                    objImmerse.arrVideos[objImmerse.currentVideo].load();
                }
                objImmerse.arrVideos[intVideo].play();
                objImmerse.arrVideos.removeClass("play").eq(intVideo).addClass("play");
                objImmerse.currentVideo = intVideo;
            } else if (intVideo > 1) {
                objImmerse.playAudioAnswer(intVideo + 2);
            }
        };

        objImmerse.playAudioAnswer = function (intAudio) {
            if (intAudio == 4) {
                objImmerse.arrPageContainer.addClass("clap");
            } else {
                objImmerse.arrPageContainer.addClass("laugh");
            }
            objImmerse.arrAudios[intAudio].play();
        };

        objImmerse.resetAudioAnswer = function () {
            objImmerse.arrPageContainer.removeClass("clap");
            objImmerse.arrPageContainer.removeClass("laugh");
        };

        objImmerse.shuffleAnswers = function (array) {
            var currentIndex = array.length, temporaryValue, randomIndex;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        };

        objImmerse.windowPopup = function (url, width, height) {
            // Calculate the position of the popup so
            // it’s centered on the screen.
            var left = (screen.width / 2) - (width / 2),
                top = (screen.height / 2) - (height / 2);

            window.open(
                url,
                "",
                "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=" + width + ",height=" + height + ",top=" + top + ",left=" + left
            );
        };

        return objImmerse;

    });
