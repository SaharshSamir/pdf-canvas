### After upload pdf

* Take each page from the pdf, create an entity from it and add it to the entity store.
  * That will require a separate hook (or maybe a regular function) that will go thru all the
  pages and create entities of it.
  * We would need a function to calculate the world coordinates for each page
  * I think the origin should be at the first page's center.

* Should entities be a react state?
