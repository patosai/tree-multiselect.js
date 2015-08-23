function textOf(el) {
  return $(el).clone().children().remove().end().text();
}
