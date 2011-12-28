var library,
	filenameInEdit = false,
	siteLocation = "",
	defaultNewPath = "New_Note.txt",
	path = defaultNewPath,
	bNewNote = true;

function init() {
	loadNotes();
	$('#deleteConfirm').modal({
		keyboard: true,
		backdrop: true
	});
	$('#newConfirm').modal({
		keyboard: true,
		backdrop: true
	});
	$('#btn_new').click(newNote);
	$('#btn_saveAndNew').click(function(e) {
		saveNote(e, function() {
			newNote(e);
		}); // needs callback.
		e.preventDefault();
	});
	$('#btn_del').click(deleteNote);
	$('#btn_save').click(saveNote);
	$('#btn_close').click(function(e) {
		$('#deleteConfirm').modal('hide');
		e.preventDefault();
	});
	$('#preview').click(function(){$('#editNote').trigger('click');	});
	$('.tabs').bind('change', function (e) {
		switch ($(e.target).attr('href')) {
			case '#preview':
				getPreview();
				break;
		}
	});
    $('.tabs').tabs();
    setUpKeyboardShortcuts();
}

function getPreview() {
	$.ajax({
		url: siteLocation + "/api/preview",
		type: "POST",
		data: { html: $('textarea').val() },
		dataType: 'html',
		statusCode: {
			403: function() {
				// fail('Logged out: save before redirecting!!');
				// toggleSaveBtn('failed');
			}
		},
		success: function(data) {
			$('#preview').html(data);
		}
	});
}

function loadNotes() {
	library = [];
	$.ajax({
		url: siteLocation + "/api/list/all",
		dataType: 'json',
		success: function(data) {
			var notes = "";

			for (var i = 0; i < data.length; ++i) {
				if (!data[i]['is_dir']) {
					path = data[i]['path'].substring(1);
					notes += makeNote(path);
					library[path] = data[i];
				}
			}

			$('#list ul').html(notes);
			$('#list ul li').live("click", loadNote);
			if ($('#list ul li').length <= 0) {
				firstRun();
			} else {
				$('#list ul li').first().trigger('click');
			}
		}
	});
}

function loadNote(e) {
	bNewNote = false;
	var elem = $(this);
	path = elem.data('filename');
	filenameInEdit = path;
	$.ajax({
		url: siteLocation + "/api/get/" + path,
		statusCode: {
			403: function() {
				fail('Logged out: save before redirecting!!');
			}
		},
		success: function(data) {
			$('#list ul li').removeClass('selected');
			elem.addClass('selected');
			$('#notehead').html(fileToTitle(path));
			data = jQuery.parseJSON(data);
			$('textarea').val(data.fileContent);
			$('small.date').text(data.formattedDate);
			getPreview();
			$('#tab_preview').trigger('click');
		}
	});
}

function renameNote(path, to) {
	$.ajax({
		url: siteLocation + "/api/move/" + path,
		type: "POST",
		data: { to: to },
		statusCode: {
			403: function() {
				toggleSaveBtn('failed');
			}
		},
		success: function(data) {
			$('#list ul li.selected').data('filename', to);
			$('#list ul li.selected').html($('<a href="#">').text(fileToTitle(to)));
			filenameInEdit = to;
			path = to;
		}
	});
}

/**
*
*	Will check is the title has been changed inline and if so rename and adjust to that.
*
*/

function checkForFileRename(path, newTitle) {
	return (path !== newTitle) ? true : false;
}

function saveNote(e, cb) {
	// need to default path to "New_Note.txt"
	// and set the document on start.
	toggleSaveBtn('save');
	if (bNewNote) {
		path = titleToFile($('#notehead').text());
	}
	$.ajax({
		url: siteLocation + "/api/put/" + path,
		type: "POST",
		data: { data: $('textarea').val() },
		statusCode: {
			403: function() {
				// fail('Logged out: save before redirecting!!');
				toggleSaveBtn('failed');
			}
		},
		success: function(data) {
			var to = titleToFile($('#notehead').text());

			if (checkForFileRename(path, to) && !bNewNote) {
				renameNote(path, to);
			}

			if (bNewNote) {
				$('#list ul li').removeClass('selected');
				$('#list ul').append($(makeNote(path)).addClass('selected'));
			}

			toggleSaveBtn();
			bNewNote = false;
			if (typeof cb === 'function') {
				cb();
			}
		}
	});
}

// Instead of opening in a dialog possibly clear the form and have a hint.
function newNote(e) {
	// $.box.show({content: $('<form id="frm_new_note"><label for="note_title">New Note Title:</label><input type="text" name="note_title" id="note_title" /><input type="submit" value="create"/></form>')});
	path = defaultNewPath;
	bNewNote = true;
	filenameInEdit = path;
	$('#notehead').html(fileToTitle(path));
	$('textarea').val('');
	$('small.date').text('');
	$('#newConfirm').modal('hide');
	e.preventDefault();
}

function deleteNote(e) {
	// var path = $('#list ul li.selected').data('filename');
	$.ajax({
		url: siteLocation + "/api/del/" + path,
		statusCode: {
			403: function() {
				fail('Logged out: save before redirecting!!');
			}
		},
		success: function(data) {
			$('#list ul li.selected').remove();
			$('#list ul li').removeClass('selected');
			$('#notehead').html('');
			$('textarea').val('');
			$('small.date').text('');
			$('#deleteConfirm').modal('hide');
			if ($('#list ul li').length <= 0) {
				firstRun();
			} else {
				$('#list ul li').first().trigger('click');
			}
		}
	});
	e.preventDefault();
}

function fail(message) {
	alert('toms fault: ' + message);
	window.location = siteLocation + "/try-again";
}

function makeNote(path) {
	return '<li data-filename="' + path + '"><a href="#">' + fileToTitle(path) + "</a></li>";
}

function fileToTitle(file) {
	return file.replace(/_/g, " ").replace(".txt", "");
}

function titleToFile(title) {
	return title.replace(/ /g, "_") + ".txt";
}

var toggleSaveBtn = function(type) {
	switch (type) {
		case 'save':
				$("#btn_save").switchClass("primary", "success", 250, function() {
					$("#btn_save").text("Saving");
				});
			break;
		case 'failed':
				$("#btn_save").switchClass("success", "danger", 250, function() {
					$("#btn_save").text("Failed");
				});
				setTimeout(function() {
					$("#btn_save").switchClass("danger", "primary", 250, function() {
						$("#btn_save").text("Save");
					});
				}, 3000);
			break;
		default:
			$("#btn_save").switchClass("success", "primary", 250, function() {
				$("#btn_save").text("Save");
			});
	}
};

var firstRun = function() {
	path = 'Welcome.txt';
	bNewNote = true;
	filenameInEdit = path;
	$('#notehead').html(fileToTitle(path));
	$('textarea').val('Welcome to Little Note.\n\nTo start straight away click on me.\n\nLittle Note allows you to create lists, todo and reminders.');
	getPreview();
	saveNote();
};

var setUpKeyboardShortcuts = function() {
	$(window).bind('keydown', 'command+s', function(e) {
		saveNote();
		e.preventDefault();
	});
	$(window).bind('keydown', 'ctrl+s', function(e) {
		saveNote();
		e.preventDefault();
	});
	$(window).bind('keydown', 'command+shift+n', function(e) {
		$('#newConfirm').modal('show');
		e.preventDefault();
	});
	$(window).bind('keydown', 'ctrl+shift+n', function(e) {
		$('#newConfirm').modal('show');
		e.preventDefault();
	});
	$('textarea').bind('keydown', 'command+s', function(e) {
		saveNote();
		e.preventDefault();
	});
	$('textarea').bind('keydown', 'ctrl+s', function(e) {
		saveNote();
		e.preventDefault();
	});
	$('textarea').bind('keydown', 'command+shift+n', function(e) {
		$('#newConfirm').modal('show');
		e.preventDefault();
	});
	$('textarea').bind('keydown', 'ctrl+shift+n', function(e) {
		$('#newConfirm').modal('show');
		e.preventDefault();
	});
};

$(function(){init();});