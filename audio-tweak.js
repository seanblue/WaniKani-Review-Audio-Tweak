// ==UserScript==
// @name          WaniKani Review Audio Tweak 2
// @namespace     https://www.wanikani.com
// @description   Allow audio to be played after review meaning questions, when reading has been previously answered correctly. Also includes setting for enabling autoplay when answer is incorrect (default: off). Originally by Takuya Kobayashi.
// @author        seanblue
// @version       1.0.0
// @include       http*://www.wanikani.com/review/session*
// @run-at        document-end
// @grant         none
// ==/UserScript==

// Original version by Takuya Kobayashi: https://greasyfork.org/en/scripts/10184-wanikani-review-audio-tweak
// This version is a reupload with the new URL for audio files.

(function () {
	'use strict';
	// BEGIN SETTINGS //
	var enableAutoPlayWhenIncorrect = false; // change to 'true' to enable
	// END SETTINGS //

	var audioUrlPrefix = 'https://cdn.wanikani.com/subjects/audio/';

	function itemStat(item) {
		var itemStatKey = (item.voc ? 'v' : item.kan ? 'k' : 'r') + item.id;
		return ($.jStorage.get(itemStatKey) || {});
	}

	additionalContent.audio = function (audioAutoplay) {
		var buttonElem, liElem, currentItem, questionType, audioElem;
		currentItem = $.jStorage.get('currentItem');
		questionType = $.jStorage.get('questionType');

		$('audio').remove();

		if (currentItem.aud && (questionType === 'reading' || itemStat(currentItem).rc >= 1)) {
			liElem = $('#option-audio');
			buttonElem = liElem.find('button');
			if (!enableAutoPlayWhenIncorrect && !$('#answer-form fieldset').hasClass('correct')) {
				audioAutoplay = false;
			}

			buttonElem.removeAttr('disabled');
			audioElem = $('<audio></audio>', { autoplay: audioAutoplay }).appendTo(liElem.removeClass('disabled').children('span'));

			$('<source></source>', {
				src: audioUrlPrefix + currentItem.aud,
				type: 'audio/mpeg'
			}).appendTo(audioElem);

			$('<source></source>', {
				src: audioUrlPrefix + currentItem.aud.replace('.mp3', '.ogg'),
				type: 'audio/ogg'
			}).appendTo(audioElem);

			audioElem[0].addEventListener('play', function () {
				buttonElem.removeClass('audio-idle').addClass('audio-play');
			});

			audioElem[0].addEventListener('ended', function () {
				buttonElem.removeClass('audio-play').addClass('audio-idle');
			});

			buttonElem.off('click');
			buttonElem.on('click', function () {
				audioElem[0].play();
			});

			liElem.off('click');
			liElem.on('click', function () {
				if ($('#user-response').is(':disabled')) {
					$('audio').trigger('play');
				}
			});
		}
	};
}());
