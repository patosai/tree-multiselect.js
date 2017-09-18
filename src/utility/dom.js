exports.createNode = function(tag, props) {
  var node = document.createElement(tag);

  if (props) {
    for (var key in props) {
      if (props.hasOwnProperty(key) && key !== 'text') {
        node.setAttribute(key, props[key]);
      }
    }
    if (props.text) {
      node.textContent = props.text;
    }
  }
  return node;
};

exports.createSelection = function(option, treeId, createCheckboxes, disableCheckboxes) {
  var props = {
    class: 'item',
    'data-key': option.id,
    'data-value': option.value
  };
  var hasDescription = !!option.description;
  if (hasDescription) {
    props['data-description'] = option.description;
  }
  if (option.initialIndex) {
    props['data-index'] = option.initialIndex;
  }
  var selectionNode = exports.createNode('div', props);

  if (hasDescription) {
    var popup = exports.createNode('span', {class: 'description', text: '?'});
    selectionNode.appendChild(popup);
  }
  if (!createCheckboxes) {
    selectionNode.innerText = option.text || option.value;
  } else {
    var optionLabelCheckboxId = `treemultiselect-${treeId}-${option.id}`;
    var inputCheckboxProps = {
      class: 'option',
      type: 'checkbox',
      id: optionLabelCheckboxId,
    };
    if (disableCheckboxes || option.disabled) {
      inputCheckboxProps.disabled = true;
    }
    var inputCheckbox = exports.createNode('input', inputCheckboxProps);
    // prepend child
    selectionNode.insertBefore(inputCheckbox, selectionNode.firstChild);

    var labelProps = {
      for: optionLabelCheckboxId,
      text: option.text || option.value
    };
    var label = exports.createNode('label', labelProps);
    selectionNode.appendChild(label);
  }

  return selectionNode;
};

exports.createSelected = function(option, disableRemoval, showSectionOnSelected) {
  var node = exports.createNode('div', {
    class: 'item',
    'data-key': option.id,
    'data-value': option.value,
    text: option.text
  });

  if (!disableRemoval) {
    var removalSpan = exports.createNode('span', {class: 'remove-selected', text: '×'});
    node.insertBefore(removalSpan, node.firstChild);
  }

  if (showSectionOnSelected) {
    var sectionSpan = exports.createNode('span', {class: 'section-name', text: option.section});
    node.appendChild(sectionSpan);
  }

  return node;
};

exports.createSection = function(sectionName, sectionId, createCheckboxes, disableCheckboxes) {
  var sectionNode = exports.createNode('div', {class: 'section', 'data-key': sectionId});

  var titleNode = exports.createNode('div', {class: 'title', text: sectionName});
  if (createCheckboxes) {
    var checkboxProps = {
      class: 'section',
      type: 'checkbox'
    };
    if (disableCheckboxes) {
      checkboxProps.disabled = true;
    }
    var checkboxNode = exports.createNode('input', checkboxProps);
    titleNode.insertBefore(checkboxNode, titleNode.firstChild);
  }
  sectionNode.appendChild(titleNode);
  return sectionNode;
};
