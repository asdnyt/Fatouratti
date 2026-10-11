package com.facturation.client.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = BluePrimary,
    onPrimary = Color.White,
    primaryContainer = BlueLight,
    onPrimaryContainer = BlueDark,
    secondary = PurplePrimary,
    onSecondary = Color.White,
    secondaryContainer = PurpleLight,
    onSecondaryContainer = PurpleDark,
    background = SlateBackground,
    surface = Color.White,
    surfaceVariant = Color(0xFFF1F5F9),
    onSurface = SlateDark
)

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF60A5FA),
    onPrimary = Color(0xFF00297B),
    secondary = Color(0xFFA78BFA),
    background = Color(0xFF0F172A),
    surface = Color(0xFF1E293B),
    surfaceVariant = Color(0xFF334155),
    onSurface = Color.White
)

@Composable
fun FacturationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
