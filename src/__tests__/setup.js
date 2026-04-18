import '@testing-library/jest-dom';

// Mock scrollTo for jsdom
Element.prototype.scrollTo = function() {};
Element.prototype.scrollBy = function() {};
