enum ThemeType {
    THEME_UNKNOWN = -1,
    THEME_LIGHT= 1,
    THEME_DARK= 2,
    THEME_OLED_DARK =22,
    THEME_SOLARIZED_LIGHT=3,
    THEME_SOLARIZED_DARK= 4,
    THEME_DRACULA=5,
    THEME_NORD= 6,
    THEME_ARITIM_DARK= 7
}

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace ThemeType {
    export function isDarkTheme(themeType: ThemeType) {
        return [
            ThemeType.THEME_DARK,
            ThemeType.THEME_OLED_DARK,
            ThemeType.THEME_SOLARIZED_DARK,
            ThemeType.THEME_ARITIM_DARK,
        ].indexOf(themeType) >= 0;
    }

    export function isLightTheme(themeType: ThemeType) {
        return !ThemeType.isDarkTheme(themeType);
    }
}

export default ThemeType;
