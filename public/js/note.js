$(function(){

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

		events: {
			'click .save': 'saveNote',
			'click .delete': 'deleteNote',
			'click .preview': 'previewNote'
		},

		initialize: function() {
			this.model.bind('change', this.render, this);
			this.model.bind('destroy', this.remove, this);
		},

		// Re-render the contents of the note.
		render: function() {
			// $(this.el).html(this.template(this.model.toJSON()));
			this.setTitle();
			this.setDate();
			this.setBody();
			return this;
		},

		setTitle: function() {
			var title = this.model.get('title');
			this.date = this.$('.title').text(title);
		},

		setDate: function() {
			var date = this.model.get('date-modified');
			this.$('.date-modified').text(date);
		},

		setBody: function() {
			var body = this.model.get('body');
			this.textarea = this.$('.note-body').val(body);
		},

		close: function() {
			this.model.save({
				body: this.textarea.val(),
				title: this.date.text()
			});
		},

		// Remove this view from the DOM.
		remove: function() {
			$(this.el).remove();
		},

		// Remove the item, destroy the model.
		clear: function() {
			this.model.destroy();
		}

	});

	window.NoteListView = Backbone.View.extend({

		tagName: 'li',

		template: _.template($('#list-item-template').html()),

		events: {
			'click .load': 'loadNote'
		},

		initialize: function() {
			this.model.bind('change', this.render, this);
			this.model.bind('destroy', this.remove, this);
		},

		// Re-render the contents of the note.
		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			this.setTitle();
			return this;
		},

		setTitle: function() {
			var title = this.model.get('title');
			this.date = this.$('.title').text(title);
		},

		// Remove this view from the DOM.
		remove: function() {
			$(this.el).remove();
		},

		// Remove the item, destroy the model.
		clear: function() {
			this.model.destroy();
		}

	});

	window.AppView = Backbone.View.extend({

		el: $("#little-note-app"),

		initialize: function() {
			this.input = this.$("#new-note");

			Notes.bind('add',   this.addOne, this);
			Notes.bind('reset', this.addAll, this);
			Notes.bind('all',   this.render, this);

			Notes.fetch();
		},

		// Add a single todo item to the list by creating a view for it, and
		// appending its element to the `<ul>`.
		addOne: function(todo) {
			var view = new NoteListView({model: note});
			$("#note-list").append(view.render().el);
		},

		// Add all items in the **Todos** collection at once.
		addAll: function() {
			Notes.each(this.addOne);
		}

	});

	// Finally, we kick things off by creating the **App**.
	window.App = new AppView;

});