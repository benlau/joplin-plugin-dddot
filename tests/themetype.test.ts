import ThemeType from "../src/types/themetype";

test("isDarkTheme", () => {
    expect(ThemeType.isDarkTheme(ThemeType.THEME_LIGHT)).toBe(false);
    expect(ThemeType.isDarkTheme(ThemeType.THEME_UNKNOWN)).toBe(false);

    expect(ThemeType.isDarkTheme(ThemeType.THEME_DARK)).toBe(true);
    expect(ThemeType.isDarkTheme(ThemeType.THEME_OLED_DARK)).toBe(true);
});

test("isLightTheme", () => {
    expect(ThemeType.isLightTheme(ThemeType.THEME_LIGHT)).toBe(true);
    expect(ThemeType.isLightTheme(ThemeType.THEME_UNKNOWN)).toBe(true);

    expect(ThemeType.isLightTheme(ThemeType.THEME_DARK)).toBe(false);
    expect(ThemeType.isLightTheme(ThemeType.THEME_OLED_DARK)).toBe(false);
});
