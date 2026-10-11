package com.facturation.client

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.facturation.client.data.local.AppDatabase
import com.facturation.client.ui.MainApp
import com.facturation.client.ui.MainViewModel
import com.facturation.client.ui.MainViewModelFactory
import com.facturation.client.ui.theme.FacturationTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialisation de la base SQLite Room locale
        val database = AppDatabase.getDatabase(applicationContext)
        val viewModelFactory = MainViewModelFactory(database.clientDao(), database.invoiceDao())

        setContent {
            FacturationTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val viewModel: MainViewModel = viewModel(factory = viewModelFactory)
                    MainApp(viewModel = viewModel)
                }
            }
        }
    }
}
