import { createTheme } from "@mui/material";

export const darkTheme = createTheme({
  palette: {
    primary: {
      main: "#023047",
      light: "#219ebc",
    },
    secondary: {
      main: "#c4d0ba",
    },
    success: {
      main: "#8ecae6",
    },
    error: {
        main: '#c14c3b'
    },
    warning: {
        main: '#fb8500'
    },
    mode: "dark",
    text: {
      primary: "#fff",
      secondary: "#B0B0B0",
    },
  },

  components: {
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        sx: {
          "& input:-webkit-autofill": {
            WebkitBoxShadow: "0 0 0 1000px transparent inset",
            WebkitTextFillColor: "inherit",
          },
        },
      },
      variants: [
        {
          props: {
            variant: "outlined",
            color: "primary",
          },
          style: {
            "& input": {
              fontSize: "14px",
            },
            "& fieldset": {
              borderColor: "#A7A7A7",
            },
            "& .Mui-focused fieldset": {
              borderColor: "#fff !important",
            },
            "& label.Mui-focused": {
              color: "#fff",
            },
          },
        },
      ],
    },
    MuiLink: {
      defaultProps: {
        color: "#fff",
      },
    },
    MuiTab: {
      defaultProps: {
        sx: {
          color: "#D6D6D6",
          textTransform: "capitalize",
          "&.Mui-selected": {
            color: "#fff",
          },
        },
      },
    },
    MuiTabs: {
      defaultProps: {
        sx: {},
      },

      styleOverrides: {
        indicator: {
          backgroundColor: "#fff",
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        fullWidth: true,
      },
      variants: [
        {
          props: {
            variant: "outlined",
          },
          style: {
            "& input": {
              fontSize: "14px",
            },
            "& fieldset": {
              borderColor: "#A7A7A7",
            },
            "& fieldset.Mui-focused ": {
              borderColor: "#fff !important",
            },
          },
        },
      ],
    },
    MuiRadio: {
      defaultProps: {
        style: {
          color: "#fff",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          fontSize: "34px",
          fontWeight: 500,
          color: "#fff",
        },
        h2: {
          fontSize: "30px",
          fontWeight: 500,
          color: "#fff",
        },
        h3: {
          fontSize: "24px",
          fontWeight: 500,
          color: "#fff",
        },
        h4: {
          fontSize: "20px",
          fontWeight: 500,
          color: "#fff",
        },
        h5: {
          fontSize: "18px",
          fontWeight: 500,
          color: "#fff",
        },
        h6: {
          fontSize: "16px",
          fontWeight: 500,
          color: "#fff",
        },
        body1: {
          fontSize: "16px",
          fontWeight: "lighter",
          color: "#fff",
        },
        body2: {
          fontSize: "14px",
          fontWeight: "lighter",
          color: "#fff",
        },
        caption: {
          fontSize: "13px",
          color: "#fff",
        },
        subtitle1: {
          fontSize: "13px",
          color: "#B0B0B0",
        },
        subtitle2: {
          fontSize: "13px",
          color: "#B0B0B0",
        },
      },
    },
    MuiPopper: {
      defaultProps: {
        sx: {
          zIndex: 1300,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "1.1rem",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: "#fff",
          textTransform: "capitalize",
          borderWidth: 2,
          ":hover": {
            borderWidth: 2,
          },
        },
      },
    },
    MuiMenuList: {
      styleOverrides: {
        root: {
          backgroundColor: "red",
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          backgroundColor: "#202137",
        },
      },
    },
  },

  spacing: [0, 4, 8, 16, 32, 64, 128, 256, 512],
});

export const colors = {
  lightPurple: "#7E91C22B",
};
