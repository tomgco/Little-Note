/**
 *
 *
 * @copyright Clock Limited 2010
 * @license http://opensource.org/licenses/bsd-license.php New BSD License
 * @author Paul Serby <paul.serby@clock.co.uk>
 * @version 1.0
 */
$.box = new function() {

	var
		overlayElement,
		boxContainer,
		boxElement,
		boxContent,
		closeButton,
		currentWidth,
		currentHeight,
		contentPlaceholder,
		currentContent,
		currentOptions;

	var defaults = {
		content: null,
		width: null,
		height: null,
		allowCloseButton: true,
		afterOpen: function() {},
		afterClose: function() {}
	};

	function init(object) {

		$(document.body)
			.append(overlayElement = $("<div>"));

		$(document.body)
			.append(boxContainer = $("<div>"));

		boxContainer.append(boxElement = $("<div>"));
		boxElement.append(closeButton = $("<span>"));
		boxElement.append(boxContent = $("<div>"));

		overlayElement.addClass("box-overlay");
		boxContainer.addClass("box-container");
		boxElement.addClass("box-element");
		boxContent.addClass("box-content");

		contentPlaceholder = $("<div>").html("jim");

		closeButton.html("x").addClass("box-close-button");
		closeButton.click(onClose);
		$(window).resize(onResize);
		close();
	}

	init(this);

	function onClose(event) {
		close();
	}

	function updatePosition() {
		var documentWidth = $(window).width();
		var documentHeight = $(window).height();

		//boxContent.css({ width: currentWidth });

		var totalWidth = boxElement.width();
		var totalHeight = boxElement.height();

		var left = (documentWidth - totalWidth) / 2;
		var top = (documentHeight - totalHeight) / 2;

		top = Math.max(0, top);

		boxElement.css({ top: $(window).scrollTop() + top, left: left });
	}

	function onResize(event) {
		updatePosition();
	}

	/**
	 * Public functions
	 */

	this.show = function(options) {

		currentOptions = $.extend(defaults, options);

		if (currentOptions.content) {
			if (currentContent) {
				replacePlaceholder();
			}
			currentContent = currentOptions.content;
			currentContent.before(contentPlaceholder);
			contentPlaceholder.hide();
			boxContent.append(currentContent);
		}

		if (!currentOptions.allowCloseButton) {
			closeButton.hide();
		}

		updatePosition();
		show();
		this.resize(currentOptions.width, currentOptions.height);
		currentOptions.afterOpen();
	};

	function show() {
		overlayElement.show();
		boxContainer.show();
	}

	this.close = function() {
		close();
		if (currentOptions) {
			currentOptions.afterOpen();
		}
	};

	function close() {
		overlayElement.hide();
		boxContainer.hide();
		replacePlaceholder();
	}

	function replacePlaceholder() {
		contentPlaceholder.after(currentContent);
		contentPlaceholder.remove();
	}

	this.resize = function(width, height) {

		if (width == null) {
			width = boxElement.width();
		} else {
			boxContent.css({ width: "100%" });
		}

		if (height == null) {
			height = boxElement.height();
		} else {
			boxContent.css({ height: height });
		}

		currentWidth = width;
		currentHeight = height;
		updatePosition();
	};

	this.autoSize = function() {
		boxElement.css({ height: "auto" });
		this.resize(currentWidth, null);
	};
};