package com.facturation.client.util

import android.content.Context
import android.content.Intent
import android.net.Uri

object WhatsAppHelper {
    fun shareSituation(context: Context, phone: String, messageText: String) {
        val cleanPhone = phone.replace(Regex("[^0-9]"), "")
        val url = if (cleanPhone.isNotEmpty()) {
            "https://api.whatsapp.com/send?phone=$cleanPhone&text=" + Uri.encode(messageText)
        } else {
            "https://api.whatsapp.com/send?text=" + Uri.encode(messageText)
        }

        val intent = Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse(url)
        }

        try {
            intent.`package` = "com.whatsapp"
            context.startActivity(intent)
        } catch (e: Exception) {
            val fallbackIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            context.startActivity(fallbackIntent)
        }
    }
}
