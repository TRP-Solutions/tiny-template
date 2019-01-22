var TinyTemplate = (function(){
	var transformations = {};

	function fill_template(element, data){
		if(!element || !element.dataset) return;
		data = data || [];
		function fill_element(inst){
			inst = inst.split(':');
			if(typeof data[inst[1]] != 'undefined'){
				if(inst[0].substring(0,5)=='data-'){
					this.dataset[inst[0].substring(5)] = data[inst[1]];
				} else if(inst[0] == 'value'){
					this.value =  data[inst[1]];
				} else if(inst[0] == 'content'){
					this.textContent = data[inst[1]] || "\xA0";
				} else if(inst[0] == 'src'){
					this.src = data[inst[1]];
				} else if(inst[0] == 'id'){
					this.id = data[inst[1]];
				} else if(inst[0] == 'checked' && data[inst[1]]){
					this.checked = data[inst[1]];
				} else if(inst[0] == 'class'){
					var className = (this.dataset.tmplClassPrefix ? this.dataset.tmplClassPrefix + ' ' : '') + data[inst[1]];
					if(this.className.baseVal) this.className.baseVal = className;
					else this.className = className;
				} else if(inst[0] == 'href'){
					this.setAttribute('href',(this.dataset.tmplHrefPrefix ? this.dataset.tmplHrefPrefix : '') + data[inst[1]]);
				}
			}
		}
		if(element.dataset.tmpl) element.dataset.tmpl.split(',').forEach(fill_element, element);
		var elems = element.querySelectorAll('[data-tmpl]');
		for(var i = 0; i < elems.length; i++){
			elems[i].dataset.tmpl.split(',').forEach(fill_element,elems[i]);
		}
	}

	function clone_template(template, data){
		if(typeof data == 'object'){
			var keys = Object.keys(data);
			for(var i = 0; i < keys.length; i++){
				var key = keys[i].split(':');
				if(key.length > 2 && key[1] == 'transform' && typeof transformations[key[2]] == 'function'){
					data[key[0]] = transformations[key[2]](data[keys[i]], key);
					delete data[keys[i]];
				}
			}
		}
		var content = template.content ? template.content : template;
		var node = content.firstElementChild ? content.firstElementChild : content.firstChild;
		var clone = document.importNode(node, true);
		fill_template(clone, data);
		if(data && data.update_radio_id){
			var radios = clone.querySelectorAll('input[type=radio]');
			for(var i = 0; i < radios.length; i++){
				var name = radios[i].name;
				var label = clone.querySelector('label[for="'+radios[i].id+'"]');
				var newid = name+':'+radios[i].value;
				label.setAttribute('for', newid);
				radios[i].id = newid;
			}
		}
		if(!(data && data.disable_random_radio)){
			var radios = clone.querySelectorAll('input[type=radio]');
			if(radios.length > 0){
				var converter = {};
				for(var i = 0; i < radios.length; i++){
					var name = radios[i].name;
					if(!converter[name]) converter[name] = 'radio_'+random_string(7);
					var labels = clone.querySelectorAll('label[for="'+radios[i].id+'"]');
					var newid = converter[name]+':'+radios[i].value;
					for(var j = 0; j < labels.length; j++){
						labels[j].setAttribute('for', newid);
					}
					radios[i].id = newid;
					radios[i].name = converter[name];
				}
			}
		}
		if(!(data && data.disable_random_checkbox)){
			var checkboxes = clone.querySelectorAll('input[type=checkbox]');
			if(checkboxes.length > 0){
				var converter = {};
				for(var i = 0; i < checkboxes.length; i++){
					var name = checkboxes[i].id;
					if(!converter[name]) converter[name] = 'checkbox_'+random_string(7);
					var labels = clone.querySelectorAll('label[for="'+checkboxes[i].id+'"]');
					for(var j = 0; j < labels.length; j++){
						labels[j].setAttribute('for', converter[name]);
					}
					checkboxes[i].id = converter[name];
				}
			}
		}
		return clone;
	}

	function activate_template(id, data, elem, do_not_insert){
		if(!id) return;
		data = data || [];
		elem = elem || document;
		var template = elem.querySelector('template[data-tmpl-name="'+id+'"]');
		if(!template) return;
		var clone = clone_template(template, data);
		if(!do_not_insert) template.parentNode.insertBefore(clone, template);
		return clone;
	}

	function reset(){
		transformations = {}
	}

	function random_string(){
		Math.random().toString(36).substr(2, 5);
	}

	return {
		'activate': activate_template,
		'fill': fill_template,
		'register_transformation': register_transformation,
		'reset': reset
	}
})()