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

exports.createSelection = function(astItem, createCheckboxes, disableCheckboxes) {
  var props = {
    class: 'item',
    'data-key': astItem.id,
    'data-value': astItem.value
  };
  var hasDescription = !!astItem.description;
  if (hasDescription) {
    props['data-description'] = astItem.description;
  }
  if (astItem.initialIndex) {
    props['data-index'] = astItem.initialIndex;
  }
  var selectionNode = exports.createNode('div', props);

  if (hasDescription) {
    var popup = exports.createNode('span', {class: 'description', text: '?'});
    selectionNode.appendChild(popup);
  }
  if (!createCheckboxes) {
    selectionNode.innerText = astItem.text || astItem.value;
  } else {
    var optionLabelCheckboxId = `treemultiselect-${astItem.treeId}-${astItem.id}`;
    var inputCheckboxProps = {
      class: 'option',
      type: 'checkbox',
      id: optionLabelCheckboxId,
    };
    if (disableCheckboxes || astItem.disabled) {
      inputCheckboxProps.disabled = true;
    }
    var inputCheckbox = exports.createNode('input', inputCheckboxProps);
    // prepend child
    selectionNode.insertBefore(inputCheckbox, selectionNode.firstChild);

    var labelProps = {
      class: astItem.disabled ? 'disabled' : '',
      for: optionLabelCheckboxId,
      text: astItem.text || astItem.value,
    };
    var label = exports.createNode('label', labelProps);
    selectionNode.appendChild(label);
  }

  return selectionNode;
};

exports.createSelected = function(astItem, disableRemoval, showSectionOnSelected) {
  var node = exports.createNode('div', {
    class: 'item',
    'data-key': astItem.id,
    'data-value': astItem.value,
    text: astItem.text
  });

  if (!disableRemoval && !astItem.disabled) {
    var removalSpan = exports.createNode('span', {class: 'remove-selected', text: '×'});
    node.insertBefore(removalSpan, node.firstChild);
  }

  if (showSectionOnSelected) {
    var sectionSpan = exports.createNode('span', {class: 'section-name', text: astItem.section});
    node.appendChild(sectionSpan);
  }

  return node;
};

exports.createSection = function(astSection, createCheckboxes, disableCheckboxes) {
  var sectionNode = exports.createNode('div', {class: 'section', 'data-key': astSection.id});

  var titleNode = exports.createNode('div', {class: 'title', text: astSection.name});
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
