function createNode(tag, props) {
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
}

function createSelection(option, treeId, createCheckboxes, disableCheckboxes, collapsible) {
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
  var selectionNode = createNode('div', props);

  if (hasDescription) {
    var popup = createNode('span', {class: 'description', text: '?'});
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
    if (disableCheckboxes) {
      inputCheckboxProps.disabled = true;
    }
    var inputCheckbox = createNode('input', inputCheckboxProps);
    // prepend child
    selectionNode.insertBefore(inputCheckbox, selectionNode.firstChild);

    var labelProps = {
      for: optionLabelCheckboxId,
      text: option.text || option.value
    };
    var label = createNode('label', labelProps);
    selectionNode.appendChild(label);
  }

  return selectionNode;
}

function createSelected(option, disableRemoval, showSectionOnSelected) {
  var node = createNode('div', {
    class: 'item',
    'data-key': option.id,
    'data-value': option.value,
    text: option.text
  });

  if (!disableRemoval) {
    var removalSpan = createNode('span', {class: 'remove-selected', text: '×'});
    node.insertBefore(removalSpan, node.firstChild);
  }

  if (showSectionOnSelected) {
    var sectionSpan = createNode('span', {class: 'section-name', text: option.section});
    node.appendChild(sectionSpan);
  }

  return node;
}

function createSection(sectionName, createCheckboxes, disableCheckboxes) {
  var sectionNode = createNode('div', {class: 'section'});

  var titleNode = createNode('div', {class: 'title', text: sectionName});
  if (createCheckboxes) {
    var checkboxProps = {
      class: 'section',
      type: 'checkbox'
    };
    if (disableCheckboxes) {
      checkboxProps.disabled = true;
    }
    var checkboxNode = createNode('input', checkboxProps);
    titleNode.insertBefore(checkboxNode, titleNode.firstChild);
  }
  sectionNode.appendChild(titleNode);
  return sectionNode;
}

module.exports = {
  createNode: createNode,
  createSelection: createSelection,
  createSelected: createSelected,
  createSection: createSection
};
