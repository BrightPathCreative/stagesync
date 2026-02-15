// PIN Configuration for Cast Members
// Assign a unique PIN to each cast member
// Format: 'PIN_NUMBER': 'cast-member-id'

// Site-wide auth: set once at entry, used for chat and director features
var STAGESYNC_AUTH_KEY = 'stagesync_chat_auth';

// Directors (Lucas, C.C, Ms Willison) - can edit calendar and personality traits. Ms Willison has no character profile.
var DIRECTOR_IDS = ['lucas', 'cc', 'jordan'];

// Who can delete chat messages (Lucas and C.C only; Ms Willison cannot)
var CHAT_DELETE_IDS = ['lucas', 'cc'];

// Who can edit props and costumes: directors + production role (Duncan, Ben, Albie)
var PROPS_COSTUMES_EDIT_IDS = ['lucas', 'cc', 'jordan', 'duncan', 'ben', 'albie'];

// Who can edit "Set The Stage" – The Set section (Kane, Lucas, C.C, Ms Willison)
var THE_SET_EDIT_IDS = ['kane', 'lucas', 'cc', 'jordan'];

var CAST_PIN_MAP = {
  // PINs assigned to cast members
  // Keep these private and share only with the respective cast member
  
  '1827': 'lucas',      // Lucas - Director
  '2938': 'cc',         // C.C - Assistant Director
  '4069': 'angus',      // Angus
  '5170': 'duncan',     // Duncan
  '6281': 'albie',      // Albie
  '7392': 'alex',       // Alex
  '8403': 'ben',        // Ben
  '9514': 'cristian',   // Cristian
  '0625': 'eli',        // Eli
  '1736': 'jeremy',     // Jeremy
  '2849': 'kane',       // Kane
  '3950': 'lenny',      // Lenny
  '4061': 'jordan'      // Ms Willison
};

// Cast member display names
var CAST_DISPLAY_NAMES = {
  'lucas': 'Lucas',
  'cc': 'C.C',
  'angus': 'Angus',
  'duncan': 'Duncan',
  'albie': 'Albie',
  'alex': 'Alex',
  'ben': 'Ben',
  'cristian': 'Cristian',
  'eli': 'Eli',
  'jeremy': 'Jeremy',
  'kane': 'Kane',
  'lenny': 'Lenny',
  'jordan': 'Ms Willison'
};
