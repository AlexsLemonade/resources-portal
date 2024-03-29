import { Blank } from 'grommet-icons'
import { normalizeColor } from 'grommet/utils'
import React from 'react'

const applyAll = (...rules) => rules.concat()
const applyWhen = (evaluation, rule) => (evaluation ? rule : '')

const DownArrow = (props) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Blank {...props}>
    <polygon points="4,8 20,8 12,16" stroke="#000" fill="#000" />
  </Blank>
)

const theme = {
  icon: {
    size: {
      xsmall: '8px',
      small: '12px',
      medium: '24px',
      large: '64px',
      xlarge: '96px'
    }
  },
  anchor: {
    fontWeight: 400,
    extend: (props) => applyWhen(props.bold, 'font-weight: 600')
  },
  textInput: {
    extend: (props) => applyWhen(props.focus, 'box-shadow: none;')
  },
  select: {
    icons: {
      margin: 'none',
      color: 'black-tint-40',
      down: DownArrow
    },
    control: {
      border: {
        radius: '4px'
      },
      extend: (props) =>
        applyAll(
          `
            border-radius: 4px;
            border-color: ${normalizeColor('black-tint-60', props.theme)};
          `,
          applyWhen(
            props.open,
            `background-color: ${normalizeColor('black-tint-80', props.theme)};`
          ),
          applyWhen(
            !props.disabled,
            `
            background-color: ${normalizeColor('white', props.theme)};
            `
          ),
          applyWhen(
            props.disabled,
            `
            border-color: ${normalizeColor('black-tint-60', props.theme)};
            background-color: ${normalizeColor('black-tint-95', props.theme)};
            `
          )
        )
    },
    options: {
      text: {
        color: 'black'
      }
    }
  },
  button: {
    border: {
      radius: '4px',
      width: '1px'
    },
    padding: {
      horizontal: '24px',
      vertical: '7px' // 8px - 1px for border
    },
    size: {
      medium: {
        border: {
          radius: '4px'
        },
        padding: {
          horizontal: '24px',
          vertical: '7px' // 8px - 1px for border
        }
      }
    },
    disabled: {
      opacity: 1
    },
    extend: (props) =>
      applyAll(
        applyWhen(
          !props.plain && !props.role,
          `
          ${applyWhen(
            !props.primary && !props.disabled,
            `
            color: ${normalizeColor('brand', props.theme)};
            &:hover, &:active {
              box-shadow: none;
              background-color: ${normalizeColor(
                'alexs-deep-blue',
                props.theme
              )};
              color: ${normalizeColor('white', props.theme)};
            }
            &:active {
              box-shadow: 0 3px 4px 0 rgba(0,0,0,0.5);
            }
          `
          )}
          ${applyWhen(
            !props.primary && props.disabled,
            `
            color: ${normalizeColor('black-tint-60', props.theme)};
            background-color: ${normalizeColor('white', props.theme)};
            border-color: ${normalizeColor('black-tint-60', props.theme)};
            `
          )}
          ${applyWhen(
            props.primary && !props.disabled,
            `
            color: ${normalizeColor('white', props.theme)};
            &:hover, &:active {
              box-shadow: none;
              background-color: ${normalizeColor(
                'alexs-deep-blue-tint-20',
                props.theme
              )};
            }
            &:active {
              box-shadow: 0 3px 4px 0 rgba(0,0,0,0.5);
            }
           `
          )}
          ${applyWhen(
            props.primary && props.disabled,
            `
            color: ${normalizeColor('white', props.theme)};
            background-color: ${normalizeColor('black-tint-60', props.theme)};
            border-color: ${normalizeColor('black-tint-60', props.theme)};
            `
          )}
          `
        ),
        applyWhen(
          props.plain && props.role === 'menuitem',
          `
          background-color: transparent;

          > div {
            padding: 4px 8px;
          }

          ${applyWhen(
            !props.selected,
            `
            &:hover {
              background-color: ${normalizeColor('black-tint-90', props.theme)};

              span {
                color: ${normalizeColor('brand', props.theme)};
              }
            }
            `
          )}
          ${applyWhen(
            props.selected || props.active,
            `
            background-color: ${normalizeColor('brand', props.theme)};

            span {
              color: ${normalizeColor('white', props.theme)};
            }
            `
          )}
          `
        ),
        applyWhen(
          props.plain &&
            !props.role &&
            !props.colorValue &&
            !(props.hoverIndicator === 'background'), // exclude suggestions
          `
          color: ${normalizeColor('brand', props.theme)};

          input {
            color: ${normalizeColor('black', props.theme)};
          }

          `
        ),
        applyWhen(
          props.plain && !props.role && props.disabled,
          `
          color: ${normalizeColor('black-tint-60', props.theme)};

          `
        ),
        applyWhen(
          props.login,
          `
          color: ${normalizeColor('black', props.theme)};
          border: none;
          background-color: ${normalizeColor('white', props.theme)};

          input {
            color: ${normalizeColor('black', props.theme)};
          }

          &:hover {
            background-color: ${normalizeColor('black-tint-90', props.theme)};
            color: ${normalizeColor('black', props.theme)};
          `
        ),
        applyWhen(
          props.critical && !props.disabled,
          `
          color: ${normalizeColor('error', props.theme)};
          border-color: ${normalizeColor('error', props.theme)};
          background-color: ${normalizeColor('white', props.theme)};

          input {
            color: ${normalizeColor('error', props.theme)};
          }

          &:hover {
            background-color: ${normalizeColor('error', props.theme)};
            color: ${normalizeColor('white', props.theme)};
          `
        ),
        applyWhen(
          props.success && !props.disabled,
          `
          color: ${normalizeColor('success', props.theme)};
          border-color: ${normalizeColor('success', props.theme)};
          background-color: ${normalizeColor('white', props.theme)};

          input {
            color: ${normalizeColor('success', props.theme)};
          }

          &:hover {
            background-color: ${normalizeColor('success', props.theme)};
            color: ${normalizeColor('white', props.theme)};
          `
        ),
        applyWhen(
          props.plain && props.underline,
          'text-decoration: underline;'
        ),
        applyWhen(props.plain && props.bold, 'font-weight: bold;')
      )
  },
  tabs: {
    gap: '91px',
    header: {
      extend: (props) => `
        border-bottom: 1px solid #CACACA;
        justify-content: ${
          props.children.length > 3 ? 'space-between' : 'start'
        };
        > div {
          ${
            props.children.length > 3 &&
            `
            display: none;
          `
          }
        }
        > button {
          position: relative;
        }
        > button > div > span {
          font-size: 21px;
        }
        > button[aria-expanded="true"] {
          font-weight: bold;
        }
        > button > div {
          margin: 0;
          border-bottom: none;
          position: relative;
        }
        > button[aria-expanded="true"] > div:after {
          content: '';
          position: absolute;
          display: block;
          width: 41px;
          height: 1px;
          top: 100%;
          left: 50%;
          transform: translate(-50%, 0);
          background-color: #FFFFFF;
        }
        > button[aria-expanded="true"]:before,
        > button[aria-expanded="true"]:after {
          content: '';
          position: absolute;
          top: 97.5%;
          width: 24px;
          border-bottom: 1px solid #cacaca;
        }
        > button[aria-expanded="true"]:before {
          left: 50%;
          transform-origin: left;
          transform: translate(-95%, 100%) rotate(20deg)
        }
        > button[aria-expanded="true"]:after {
          right: 50%;
          transform-origin: right;
          transform: translate(95%, 100%) rotate(-20deg)
    `
    }
  },
  calendar: {
    large: {
      daySize: '73.14px',
      fontSize: '20px',
      lineHeight: 1.11
    },
    medium: {
      daySize: '36.57px',
      fontSize: '12px',
      lineHeight: 1.45
    },
    small: {
      daySize: '18.29px',
      fontSize: '9.33px',
      lineHeight: 1.375
    }
  },
  chart: {},
  checkBox: {
    color: 'brand',
    check: {
      radius: '4px'
    },
    size: '16px',
    toggle: {
      radius: '16px',
      size: '32px'
    },
    border: {
      width: '1px',
      color: {
        dark: 'black-tint-80',
        light: 'black-tint-80'
      }
    },
    hover: {
      border: {
        color: {
          dark: 'black-tint-60',
          light: 'black-tint-60'
        }
      }
    },
    margin: {
      vertical: 'small'
    },
    extend: (props) =>
      applyWhen(
        !props.reverse,
        `
        align-items: start;
        margin: 0 8px;
        div:first-child {
          margin-top: 4px;
        }
      `
      )
  },
  clock: {
    analog: {
      hour: {
        size: '16px',
        width: '5px'
      },
      minute: {
        size: '8px',
        width: '3px'
      },
      second: {
        size: '6px',
        width: '2px'
      },
      size: {
        huge: '192px',
        large: '96px',
        medium: '64px',
        small: '48px',
        xlarge: '144px'
      }
    },
    digital: {
      text: {
        large: {
          height: 1.167,
          size: '14.66px'
        },
        medium: {
          height: 1.375,
          size: '12px'
        },
        small: {
          height: 1.43,
          size: '9.33px'
        },
        xlarge: {
          height: 1.1875,
          size: '17.33px'
        },
        xsmall: {
          height: 1.5,
          size: '6.66px'
        },
        xxlarge: {
          height: 1.125,
          size: '22.66px'
        }
      }
    }
  },
  date: '2020-03-20T17:19:10.000Z',
  defaultMode: 'light',
  diagram: {
    line: {}
  },
  formField: {
    border: {
      color: 'black-tint-60',
      error: {
        size: '12px',
        color: {
          dark: 'white',
          light: 'status-critical'
        }
      },
      position: 'inner',
      side: 'all',
      size: 'xsmall',
      style: 'solid'
    },
    content: {
      pad: 'medium'
    },
    disabled: {
      background: {
        color: 'status-disabled',
        opacity: 'medium'
      }
    },
    error: {
      color: 'status-critical',
      margin: {
        horizontal: 'none',
        vertical: 'xsmall'
      }
    },
    help: {
      color: 'black-tint-40',
      margin: {
        start: 'none',
        bottom: 'xsmall'
      }
    },
    info: {
      color: 'text-xweak',
      margin: {
        horizontal: 'none',
        vertical: 'xsmall'
      }
    },
    label: {
      margin: {
        horizontal: 'none',
        bottom: '12px' // plus 4 = 16px
      },
      size: 'medium'
    },
    margin: {
      vertical: 'medium'
    },
    round: '4px',
    extend: (props) =>
      applyAll(
        `
      // FormField help
      // Same styles as components/InputHelperText.js
      // Which is used for MarkDown type helper text
      label + span {
        font-style: italic;
        font-size: 12px;
        line-height: 18px;
      }
      button, input, textarea {
        border: none;
      }
    `,
        applyWhen(
          props.checkbox,
          `
        > div {
          border: none;
          > div {
            padding: 0;
          }
        }
      `
        ),
        applyWhen(
          props.borderless,
          `
        > div {
          border: none;
        }
          `
        )
      )
  },
  global: {
    active: {
      background: 'active-background',
      color: 'active-text'
    },
    borderSize: {
      large: '12px',
      medium: '8px',
      small: '3px',
      xlarge: '16px',
      xsmall: '1px'
    },
    breakpoints: {
      large: {},
      medium: {
        value: '1024px'
      },
      small: {
        borderSize: {
          large: '4px',
          medium: '3px',
          small: '2px',
          xlarge: '8px',
          xsmall: '1px'
        },
        edgeSize: {
          hair: '1px',
          large: '16px',
          medium: '8px',
          none: '0px',
          small: '4px',
          xlarge: '32px',
          xsmall: '2px',
          xxsmall: '2px'
        },
        size: {
          full: '100%',
          large: '256px',
          medium: '128px',
          small: '64px',
          xlarge: '512px',
          xsmall: '32px',
          xxsmall: '16px'
        },
        value: 512
      }
    },
    colors: {
      gradient: 'linear-gradient(180deg, #FDFDFD 0%, #EDF7FD 100%)',
      'gradient-reverse': 'linear-gradient(0deg, #FDFDFD 0%, #EDF7FD 100%)',
      'alexs-deep-blue': '#003595',
      'alexs-deep-blue-tint-20': '#3E58AA',
      'alexs-deep-blue-tint-40': '#737EBF',
      'alexs-deep-blue-tint-70': '#B9BCDF',
      'alexs-light-blue': '#145ECC',
      'alexs-light-blue-tint-20': '#437ED6',
      'alexs-light-blue-tint-40': '#729EE0',
      'alexs-light-blue-tint-60': '#B9CFF0',
      'alexs-lemonade': '#FFDD00',
      'alexs-lemonade-tint-20': '#FFE303',
      'alexs-lemonade-tint-40': '#FFE964',
      'alexs-lemonade-tint-60': '#FFF09A',
      'alexs-lemonade-tint-75': '#FFF5C0',
      'powder-blue': '#C9ECFA',
      dawn: '#EDF7FD',
      'soda-orange': '#E55517',
      'soda-orange-tint-20': '#ec7643',
      'soda-orange-tint-40': '#F09872',
      'soda-orange-tint-60': '#F5BAA1',
      'soda-orange-tint-80': '#FADCD0',
      'soda-orange-tint-90': '#FCEDE7',
      'soda-orange-shade-20': '#B74412',
      'soda-orange-shade-40': '#89320D',
      'soda-orange-shade-60': '#5B2209',
      'savana-green': '#98BF61',
      'savana-green-tint-40': '#C1D8A0',
      'savana-green-tint-60': '#D5E5BF',
      'savana-green-tint-80': '#EAF2DF',
      'savana-green-shade-20': '#7BA342',
      'savana-green-shade-40': '#5C7A31',
      'savana-green-shade-60': '#3D5121',
      'savana-green-shade-80': '#1E2810',
      black: '#000000',
      'black-tint-20': '#333333',
      'black-tint-30': '#4A4A4A',
      'black-tint-40': '#666666',
      'black-tint-60': '#999999',
      'black-tint-80': '#CCCCCC',
      'black-tint-90': '#E5E5E5',
      'black-tint-95': '#F2F2F2',
      white: '#FDFDFD',
      info: '#003595', // alexs-deep-blue
      success: '#41A36D',
      'success-shade-20': '#348257',
      error: '#DB3B28',
      'error-shade-20': '#A72A1B',
      warning: '#FFDD00', // alexs-lemonade
      'active-background': 'brand',
      'active-text': 'text-strong',
      'background-highlight': '#F2F2F2',
      background: {
        dark: '#111111',
        light: 'white'
      },
      'background-back': {
        dark: '#111111',
        light: 'white'
      },
      'background-contrast': {
        dark: '#FFFFFF',
        light: 'white'
      },
      'background-front': {
        dark: '#222222',
        light: 'white'
      },
      border: {
        dark: '#444444',
        light: 'black-tint-80'
      },
      brand: {
        dark: 'alexs-deep-blue',
        light: 'alexs-deep-blue'
      },
      control: 'brand',
      'graph-0': 'brand',
      'graph-1': 'status-warning',
      'selected-background': 'brand',
      'selected-text': 'text',
      'status-critical': '#FF4040',
      'status-disabled': '#CCCCCC',
      'status-ok': '#00C781',
      'status-unknown': '#CCCCCC',
      'status-warning': '#FFAA15',
      text: {
        dark: '#FDFDFD',
        light: '#000000'
      },
      'text-strong': {
        dark: '#FFFFFF',
        light: '#000000'
      },
      'text-weak': {
        dark: '#CCCCCC',
        light: '#999999'
      },
      'text-xweak': {
        dark: '#999999',
        light: '#666666'
      },
      focus: 'brand',
      'border-black': '#F2F2F2',
      'border-brand': '#BAEFFE'
    },
    control: {
      border: {
        radius: '4px'
      }
    },
    drop: {
      border: {
        radius: '4px'
      },
      extend: (props) => `
        border: 1px solid ${normalizeColor('black-tint-60', props.theme)};
        margin-top: 4px;
      `,
      active: {
        background: 'red'
      }
    },
    edgeSize: {
      hair: '1px',
      large: '32px',
      medium: '16px',
      none: '0px',
      responsiveBreakpoint: 'small',
      small: '8px',
      xlarge: '48px',
      xxlarge: '64px',
      gutter: '40px',
      xsmall: '4px',
      xxsmall: '2px'
    },
    elevation: {
      light: {
        medium: '0 2px 18px 1px rgba(0, 0, 0, 0.1)'
      }
    },
    font: {
      family: 'Source Sans Pro',
      height: '24px',
      maxWidth: '192px',
      size: '16px'
    },
    hover: {
      background: 'active-background',
      color: 'active-text'
    },
    input: {
      font: {
        height: '28px'
      },
      padding: '6px',
      weight: 400
    },
    selected: {
      background: 'selected-background',
      color: 'selected-text'
    },
    size: {
      full: '100%',
      large: `${8 * 91}px`,
      medium: `${8 * 65}px`,
      small: '128px',
      xlarge: `${8 * 130}px`,
      xsmall: '64px',
      xxlarge: `${8 * 156}px`,
      xxsmall: '32px'
    },
    spacing: '16px'
  },
  heading: {
    font: {
      family: 'Source Sans Pro',
      weight: 'bold'
    },
    extend: (props) =>
      props.serif ? `font-family: 'Zilla Slab'; font-weight: 500` : null,
    level: {
      '1': {
        large: {
          height: '59px',
          maxWidth: null,
          size: '55px'
        },
        medium: {
          height: 1.5,
          maxWidth: null,
          size: '67px'
        },
        small: {
          height: '27px',
          maxWidth: null,
          size: '23px'
        },
        xlarge: {
          height: '80px',
          maxWidth: null,
          size: '76px'
        }
      },
      '2': {
        large: {
          height: '40px',
          maxWidth: null,
          size: '36px'
        },
        medium: {
          height: 1.5,
          maxWidth: null,
          size: '50px'
        },
        small: {
          height: '24px',
          maxWidth: null,
          size: '20px'
        },
        xlarge: {
          height: '48px',
          maxWidth: null,
          size: '44px'
        }
      },
      '3': {
        large: {
          height: '32px',
          maxWidth: null,
          size: '28px'
        },
        medium: {
          height: 1.5,
          maxWidth: null,
          size: '38px'
        },
        small: {
          height: '21px',
          maxWidth: null,
          size: '17px'
        },
        xlarge: {
          height: '37px',
          maxWidth: null,
          size: '33px'
        }
      },
      '4': {
        large: {
          height: '24px',
          maxWidth: null,
          size: '20px'
        },
        medium: {
          height: 1.5,
          maxWidth: null,
          size: '28px'
        },
        small: {
          height: '19px',
          maxWidth: null,
          size: '15px'
        },
        xlarge: {
          height: '27px',
          maxWidth: null,
          size: '23px'
        }
      },
      '5': {
        large: {
          height: '15px',
          maxWidth: null,
          size: '11px'
        },
        medium: {
          height: 1.524,
          maxWidth: null,
          size: '21px'
        },
        small: {
          height: '15px',
          maxWidth: null,
          size: '11px'
        },
        xlarge: {
          height: '15px',
          maxWidth: null,
          size: '11px'
        }
      },
      '6': {
        large: {
          height: '13px',
          maxWidth: null,
          size: '9px'
        },
        medium: {
          height: '13px',
          maxWidth: null,
          size: '9px'
        },
        small: {
          height: '13px',
          maxWidth: null,
          size: '9px'
        },
        xlarge: {
          height: '13px',
          maxWidth: null,
          size: '9px'
        }
      }
    }
  },
  layer: {
    background: 'white'
  },
  meter: {},
  name: 'resources-portal',
  paragraph: {
    large: {
      height: '32px',
      maxWidth: undefined,
      size: '21px'
    },
    medium: {
      height: '24px',
      maxWidth: undefined,
      size: '16px'
    },
    small: {
      height: '16px',
      maxWidth: undefined,
      size: '12px'
    },
    xlarge: {
      height: '21px',
      maxWidth: undefined,
      size: '17px'
    },
    xxlarge: {
      height: '27px',
      maxWidth: undefined,
      size: '23px'
    }
  },
  radioButton: {
    color: 'black-tint-80',
    size: '16px',
    border: {
      width: '1px',
      color: {
        dark: 'black-tint-80',
        light: 'black-tint-80'
      }
    },
    hover: {
      border: {
        color: {
          dark: 'black-tint-60',
          light: 'black-tint-60'
        }
      }
    }
  },
  rounding: 4,
  scale: 1,
  spacing: 16,
  text: {
    extend: (props) =>
      applyAll(
        applyWhen(props.italic, 'font-style: italic'),
        applyWhen(
          props.serif,
          `
          font-family: 'Zilla Slab';
          font-weight: 500;
        `
        )
      ),
    large: {
      height: '32px',
      maxWidth: '235px',
      size: '21px'
    },
    medium: {
      height: '24px',
      maxWidth: '192px',
      size: '16px'
    },
    small: {
      height: '18px',
      maxWidth: '171px',
      size: '12px'
    },
    xlarge: {
      height: '42px',
      maxWidth: '277px',
      size: '28px'
    },
    xsmall: {
      height: '13px',
      maxWidth: '149px',
      size: '9px'
    },
    xxlarge: {
      height: '27px',
      maxWidth: '363px',
      size: '23px'
    }
  }
}

export default theme
