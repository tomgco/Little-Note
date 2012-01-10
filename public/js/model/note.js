// Note model
// -----

// basic note model has `filename`, `body`, `dateModified`
window.Note = Backbone.Model.extend({
	// Default attributes for a note
	defaults: function() {
		return {
		};
	}
});

// Note Collection

window.NoteList = Backbone.Collection.extend({
	model: Note,

	localStorage: new Store('notes'),

	comparator: function(note) {
		return todo.get('dateModified');
	}
});

window.Notes = new NoteList;

window.NoteView = Backbone.View.extend({
	tagName: 'li',

	events: {
		'#btn_save': 'saveNote',
		'#btn_del': 'deleteNote'
	},

	initialize: function() {
		this.model.bind('change', this.render, this);
		this.model.bind('destroy', this.remove, this);
	}
});