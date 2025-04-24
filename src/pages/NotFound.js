import React from 'react';

   function NotFound() {
     return React.createElement(
       'div',
       { style: { textAlign: 'center', padding: '50px' } },
       React.createElement('h1', null, '404 - Page Not Found'),
       React.createElement('p', null, 'Sorry, the page you’re looking for doesn’t exist.')
     );
   }

   export default NotFound;