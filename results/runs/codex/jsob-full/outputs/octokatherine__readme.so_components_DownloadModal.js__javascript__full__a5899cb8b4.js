'use strict';

Object.defineProperty(module.exports, '__esModule', { value: true });

const {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} = require('@headlessui/react');

const element = React.createElement;

function DownloadModal({ showModal, setShowModal }) {
  return element(
    Transition,
    { show: showModal },
    element(
      Dialog,
      {
        as: 'div',
        className: 'fixed inset-0 z-10 overflow-y-auto',
        onClose: () => setShowModal(false),
      },
      element(
        'div',
        {
          className:
            'flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0',
        },
        element(
          TransitionChild,
          {
            enter: 'ease-out duration-300',
            enterFrom: 'opacity-0',
            enterTo: 'opacity-100',
            leave: 'ease-in duration-200',
            leaveFrom: 'opacity-100',
            leaveTo: 'opacity-0',
          },
          element(DialogBackdrop, {
            className:
              'fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity',
          }),
        ),
        element(
          'span',
          {
            className: 'hidden sm:inline-block sm:align-middle sm:h-screen',
            'aria-hidden': 'true',
          },
          '\u200b',
        ),
        element(
          TransitionChild,
          {
            enter: 'ease-out duration-300',
            enterFrom: 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95',
            enterTo: 'opacity-100 translate-y-0 sm:scale-100',
            leave: 'ease-in duration-200',
            leaveFrom: 'opacity-100 translate-y-0 sm:scale-100',
            leaveTo: 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95',
          },
          element(
            DialogPanel,
            {
              className:
                'inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6',
            },
            element(
              'div',
              null,
              element('p', { className: 'text-center text-7xl' }, '🎉'),
              element(
                'div',
                { className: 'mt-3 text-center sm:mt-5' },
                element(
                  DialogTitle,
                  {
                    as: 'h3',
                    className: 'text-lg font-medium leading-6 text-gray-900',
                  },
                  'Readme Generated!',
                ),
                element(
                  'div',
                  { className: 'mt-2' },
                  element(
                    'p',
                    { className: 'text-sm text-gray-500' },
                    'Thanks for using readme.so! Feel free to reach out to me on',
                    ' ',
                    element(
                      'a',
                      {
                        href: 'https://twitter.com/katherinecodes',
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        className: 'text-emerald-500 hover:text-emerald-400',
                      },
                      'Twitter',
                    ),
                    ' ',
                    'with any feedback.',
                  ),
                  element(
                    'p',
                    { className: 'mt-3 text-sm text-gray-500' },
                    'If you found this product helpful, consider supporting me!',
                  ),
                ),
              ),
            ),
            element(
              'div',
              { className: 'flex justify-center mx-auto mt-5 sm:mt-6' },
              element(
                'a',
                {
                  href: 'https://www.buymeacoffee.com/katherinecodes',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                },
                element('img', {
                  src: 'https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=katherinecodes&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff',
                  alt: 'Buy me a coffee',
                }),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

Object.defineProperty(module.exports, 'DownloadModal', {
  enumerable: true,
  get: () => DownloadModal,
});
