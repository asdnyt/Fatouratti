import JSZip from 'jszip';

export interface AndroidFile {
  path: string;
  name: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'properties';
  content: string;
  description: string;
}

export const ANDROID_FILES: AndroidFile[] = [
  {
    path: 'app/src/main/java/com/facturation/client/MainActivity.kt',
    name: 'MainActivity.kt',
    language: 'kotlin',
    description: 'Point d\'entrée Android natif avec Jetpack Compose et injection ViewModel',
    content: `package com.facturation.client

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
`,
  },
  {
    path: 'app/src/main/java/com/facturation/client/data/model/Client.kt',
    name: 'Client.kt',
    language: 'kotlin',
    description: 'Entité Room Client pour le stockage SQLite local',
    content: `package com.facturation.client.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "clients")
data class Client(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val phone: String,
    val address: String = "",
    val createdAt: Long = System.currentTimeMillis()
)
`,
  },
  {
    path: 'app/src/main/java/com/facturation/client/data/model/Invoice.kt',
    name: 'Invoice.kt',
    language: 'kotlin',
    description: 'Entité Facture / Bon de Vente liée au client avec calculs',
    content: `package com.facturation.client.data.model

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "invoices",
    foreignKeys = [
        ForeignKey(
            entity = Client::class,
            parentColumns = ["id"],
            childColumns = ["clientId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("clientId")]
)
data class Invoice(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val invoiceNumber: String,
    val clientId: Long,
    val clientName: String,
    val date: String,
    val totalAmount: Double,
    val paidAmount: Double,
    val remainingAmount: Double = (totalAmount - paidAmount).coerceAtLeast(0.0),
    val notes: String = "",
    val createdAt: Long = System.currentTimeMillis()
)
`,
  },
  {
    path: 'app/src/main/java/com/facturation/client/data/model/InvoiceItem.kt',
    name: 'InvoiceItem.kt',
    language: 'kotlin',
    description: 'Ligne de facture (Désignation, Quantité, Prix unitaire, Total)',
    content: `package com.facturation.client.data.model

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "invoice_items",
    foreignKeys = [
        ForeignKey(
            entity = Invoice::class,
            parentColumns = ["id"],
            childColumns = ["invoiceId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("invoiceId")]
)
data class InvoiceItem(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val invoiceId: Long = 0,
    val designation: String,
    val quantity: Double,
    val unitPrice: Double,
    val total: Double = quantity * unitPrice
)
`,
  },
  {
    path: 'app/src/main/java/com/facturation/client/data/local/ClientDao.kt',
    name: 'ClientDao.kt',
    language: 'kotlin',
    description: 'DAO Room pour les requêtes SQLite clients et calcul du solde restant',
    content: `package com.facturation.client.data.local

import androidx.room.*
import com.facturation.client.data.model.Client
import kotlinx.coroutines.flow.Flow

data class ClientWithBalance(
    val id: Long,
    val name: String,
    val phone: String,
    val address: String,
    val remainingBalance: Double
)

@Dao
interface ClientDao {
    @Query("SELECT * FROM clients ORDER BY name ASC")
    fun getAllClients(): Flow<List<Client>>

    @Query("""
        SELECT c.id, c.name, c.phone, c.address, 
               COALESCE(SUM(i.totalAmount - i.paidAmount), 0.0) as remainingBalance
        FROM clients c
        LEFT JOIN invoices i ON c.id = i.clientId
        GROUP BY c.id
        ORDER BY c.name ASC
    """)
    fun getClientsWithBalance(): Flow<List<ClientWithBalance>>

    @Query("SELECT * FROM clients WHERE id = :id LIMIT 1")
    suspend fun getClientById(id: Long): Client?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertClient(client: Client): Long

    @Update
    suspend fun updateClient(client: Client)

    @Delete
    suspend fun deleteClient(client: Client)
}
`,
  },
  {
    path: 'app/src/main/java/com/facturation/client/data/local/InvoiceDao.kt',
    name: 'InvoiceDao.kt',
    language: 'kotlin',
    description: 'DAO Room pour la facturation, historique et synthèse financière',
    content: `package com.facturation.client.data.local

import androidx.room.*
import com.facturation.client.data.model.Invoice
import com.facturation.client.data.model.InvoiceItem
import kotlinx.coroutines.flow.Flow

data class ClientFinancialSummary(
    val clientId: Long,
    val clientName: String,
    val clientPhone: String,
    val invoiceCount: Int,
    val totalSales: Double,
    val totalPaid: Double,
    val totalRemaining: Double
)

@Dao
interface InvoiceDao {
    @Query("SELECT * FROM invoices ORDER BY id DESC")
    fun getAllInvoices(): Flow<List<Invoice>>

    @Query("SELECT * FROM invoices WHERE clientId = :clientId ORDER BY id DESC")
    fun getInvoicesForClient(clientId: Long): Flow<List<Invoice>>

    @Query("SELECT * FROM invoice_items WHERE invoiceId = :invoiceId")
    suspend fun getItemsForInvoice(invoiceId: Long): List<InvoiceItem>

    @Query("""
        SELECT c.id as clientId, c.name as clientName, c.phone as clientPhone,
               COUNT(i.id) as invoiceCount,
               COALESCE(SUM(i.totalAmount), 0.0) as totalSales,
               COALESCE(SUM(i.paidAmount), 0.0) as totalPaid,
               COALESCE(SUM(i.totalAmount - i.paidAmount), 0.0) as totalRemaining
        FROM clients c
        LEFT JOIN invoices i ON c.id = i.clientId
        GROUP BY c.id
        ORDER BY totalRemaining DESC, c.name ASC
    """)
    fun getFinancialSummaries(): Flow<List<ClientFinancialSummary>>

    @Insert
    suspend fun insertInvoice(invoice: Invoice): Long

    @Insert
    suspend fun insertInvoiceItems(items: List<InvoiceItem>)

    @Transaction
    suspend fun insertCompleteInvoice(invoice: Invoice, items: List<InvoiceItem>): Long {
        val invoiceId = insertInvoice(invoice)
        val linkedItems = items.map { it.copy(invoiceId = invoiceId) }
        insertInvoiceItems(linkedItems)
        return invoiceId
    }

    @Query("UPDATE invoices SET paidAmount = :newPaid, remainingAmount = :newRemaining WHERE id = :invoiceId")
    suspend fun updatePayment(invoiceId: Long, newPaid: Double, newRemaining: Double)

    @Delete
    suspend fun deleteInvoice(invoice: Invoice)
}
`,
  },
  {
    path: 'app/src/main/java/com/facturation/client/data/local/AppDatabase.kt',
    name: 'AppDatabase.kt',
    language: 'kotlin',
    description: 'Base de données SQLite Room locale (fonctionne 100% hors-ligne)',
    content: `package com.facturation.client.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.facturation.client.data.model.Client
import com.facturation.client.data.model.Invoice
import com.facturation.client.data.model.InvoiceItem

@Database(
    entities = [Client::class, Invoice::class, InvoiceItem::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun clientDao(): ClientDao
    abstract fun invoiceDao(): InvoiceDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "facturation_database"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/facturation/client/ui/MainViewModel.kt',
    name: 'MainViewModel.kt',
    language: 'kotlin',
    description: 'ViewModel réactif gérant les calculs et flux de données StateFlow',
    content: `package com.facturation.client.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.facturation.client.data.local.ClientDao
import com.facturation.client.data.local.ClientWithBalance
import com.facturation.client.data.local.InvoiceDao
import com.facturation.client.data.local.ClientFinancialSummary
import com.facturation.client.data.model.Client
import com.facturation.client.data.model.Invoice
import com.facturation.client.data.model.InvoiceItem
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class MainViewModel(
    private val clientDao: ClientDao,
    private val invoiceDao: InvoiceDao
) : ViewModel() {

    val clientsWithBalance: StateFlow<List<ClientWithBalance>> = clientDao.getClientsWithBalance()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val financialSummaries: StateFlow<List<ClientFinancialSummary>> = invoiceDao.getFinancialSummaries()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _selectedClient = MutableStateFlow<Client?>(null)
    val selectedClient: StateFlow<Client?> = _selectedClient.asStateFlow()

    fun selectClient(client: Client) {
        _selectedClient.value = client
    }

    fun addClient(name: String, phone: String, address: String, onComplete: (Long) -> Unit = {}) {
        viewModelScope.launch {
            val id = clientDao.insertClient(
                Client(name = name.trim(), phone = phone.trim(), address = address.trim())
            )
            onComplete(id)
        }
    }

    fun saveInvoice(
        client: Client,
        items: List<InvoiceItem>,
        paidAmount: Double,
        notes: String = "",
        onComplete: () -> Unit
    ) {
        viewModelScope.launch {
            val totalAmount = items.sumOf { it.quantity * it.unitPrice }
            val remainingAmount = (totalAmount - paidAmount).coerceAtLeast(0.0)
            val dateStr = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault()).format(Date())
            val invoiceNumber = "FACT-" + SimpleDateFormat("yyyyMMdd-HHmm", Locale.getDefault()).format(Date())

            val invoice = Invoice(
                invoiceNumber = invoiceNumber,
                clientId = client.id,
                clientName = client.name,
                date = dateStr,
                totalAmount = totalAmount,
                paidAmount = paidAmount,
                remainingAmount = remainingAmount,
                notes = notes
            )

            invoiceDao.insertCompleteInvoice(invoice, items)
            onComplete()
        }
    }

    fun getInvoicesForClient(clientId: Long): Flow<List<Invoice>> {
        return invoiceDao.getInvoicesForClient(clientId)
    }

    fun recordPayment(invoiceId: Long, currentPaid: Double, currentTotal: Double, addedPayment: Double) {
        viewModelScope.launch {
            val newPaid = (currentPaid + addedPayment).coerceAtMost(currentTotal)
            val newRemaining = (currentTotal - newPaid).coerceAtLeast(0.0)
            invoiceDao.updatePayment(invoiceId, newPaid, newRemaining)
        }
    }
}

class MainViewModelFactory(
    private val clientDao: ClientDao,
    private val invoiceDao: InvoiceDao
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(MainViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return MainViewModel(clientDao, invoiceDao) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/facturation/client/ui/MainApp.kt',
    name: 'MainApp.kt',
    language: 'kotlin',
    description: 'Navigation Jetpack Compose avec barre en bas : Clients | Factures | Situation',
    content: `package com.facturation.client.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import com.facturation.client.data.model.Client
import com.facturation.client.ui.screens.ClientHistoryScreen
import com.facturation.client.ui.screens.ClientsScreen
import com.facturation.client.ui.screens.InvoiceScreen
import com.facturation.client.ui.screens.SituationScreen

enum class NavItem(val title: String, val icon: ImageVector) {
    CLIENTS("Clients", Icons.Default.People),
    FACTURES("Factures", Icons.Default.Receipt),
    SITUATION("Situation", Icons.Default.Assessment)
}

@Composable
fun MainApp(viewModel: MainViewModel) {
    var currentTab by remember { mutableStateOf(NavItem.CLIENTS) }
    var viewingClientHistory by remember { mutableStateOf<Long?>(null) }

    Scaffold(
        bottomBar = {
            NavigationBar {
                NavItem.values().forEach { item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.title) },
                        label = { Text(item.title) },
                        selected = currentTab == item && viewingClientHistory == null,
                        onClick = {
                            viewingClientHistory = null
                            currentTab = item
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        Surface(modifier = Modifier.padding(innerPadding)) {
            when {
                viewingClientHistory != null -> {
                    ClientHistoryScreen(
                        clientId = viewingClientHistory!!,
                        viewModel = viewModel,
                        onBack = { viewingClientHistory = null }
                    )
                }
                currentTab == NavItem.CLIENTS -> {
                    ClientsScreen(
                        viewModel = viewModel,
                        onClientClick = { clientWithBalance ->
                            viewModel.selectClient(
                                Client(
                                    id = clientWithBalance.id,
                                    name = clientWithBalance.name,
                                    phone = clientWithBalance.phone,
                                    address = clientWithBalance.address
                                )
                            )
                            currentTab = NavItem.FACTURES
                        }
                    )
                }
                currentTab == NavItem.FACTURES -> {
                    InvoiceScreen(
                        viewModel = viewModel,
                        onInvoiceSaved = {
                            currentTab = NavItem.SITUATION
                        }
                    )
                }
                currentTab == NavItem.SITUATION -> {
                    SituationScreen(
                        viewModel = viewModel,
                        onSelectClientForHistory = { clientId ->
                            viewingClientHistory = clientId
                        }
                    )
                }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/facturation/client/ui/screens/ClientsScreen.kt',
    name: 'ClientsScreen.kt',
    language: 'kotlin',
    description: 'Écran 1 Clients : Liste des clients sous forme de cartes, solde et formulaire d\'ajout',
    content: `package com.facturation.client.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.facturation.client.data.local.ClientWithBalance
import com.facturation.client.ui.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClientsScreen(
    viewModel: MainViewModel,
    onClientClick: (ClientWithBalance) -> Unit
) {
    val clients by viewModel.clientsWithBalance.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Clients", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Icon(Icons.Default.Add, contentDescription = "Ajouter un client", tint = Color.White)
            }
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            if (clients.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Aucun client. Appuyez sur + pour ajouter.", color = Color.Gray)
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(clients) { client ->
                        ClientCard(client = client, onClick = { onClientClick(client) })
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        AddClientDialog(
            onDismiss = { showAddDialog = false },
            onConfirm = { name, phone, address ->
                viewModel.addClient(name, phone, address)
                showAddDialog = false
            }
        )
    }
}

@Composable
fun ClientCard(client: ClientWithBalance, onClick: () -> Unit) {
    val remainingColor = if (client.remainingBalance > 0) Color(0xFFDC2626) else Color(0xFF16A34A)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = client.name,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp
                )
                Text(
                    text = "Solde: %.2f €".format(client.remainingBalance),
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = remainingColor
                )
            }
            Spacer(modifier = Modifier.height(6.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Default.Phone,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = Color.Gray
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(text = client.phone, fontSize = 14.sp, color = Color.Gray)
            }
            if (client.address.isNotBlank()) {
                Text(text = client.address, fontSize = 12.sp, color = Color.Gray)
            }
        }
    }
}

@Composable
fun AddClientDialog(onDismiss: () -> Unit, onConfirm: (String, String, String) -> Unit) {
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Ajouter un client", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Nom du client *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { Text("Téléphone *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = address,
                    onValueChange = { address = it },
                    label = { Text("Adresse (facultatif)") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { if (name.isNotBlank() && phone.isNotBlank()) onConfirm(name, phone, address) },
                enabled = name.isNotBlank() && phone.isNotBlank()
            ) {
                Text("Enregistrer")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Annuler")
            }
        }
    )
}
`,
  },
  {
    path: 'app/src/main/java/com/facturation/client/ui/screens/InvoiceScreen.kt',
    name: 'InvoiceScreen.kt',
    language: 'kotlin',
    description: 'Écran 2 Facture / Bon de Vente : Multi-lignes réactives, calcul automatique, résumé financier',
    content: `package com.facturation.client.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.facturation.client.data.model.InvoiceItem
import com.facturation.client.ui.MainViewModel

class DraftItem(
    initialDesignation: String = "",
    initialQuantity: String = "1",
    initialUnitPrice: String = ""
) {
    var designation by mutableStateOf(initialDesignation)
    var quantityStr by mutableStateOf(initialQuantity)
    var unitPriceStr by mutableStateOf(initialUnitPrice)

    val quantity: Double get() = quantityStr.toDoubleOrNull() ?: 0.0
    val unitPrice: Double get() = unitPriceStr.toDoubleOrNull() ?: 0.0
    val total: Double get() = quantity * unitPrice
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InvoiceScreen(
    viewModel: MainViewModel,
    onInvoiceSaved: () -> Unit
) {
    val selectedClient by viewModel.selectedClient.collectAsState()
    val clientsWithBalance by viewModel.clientsWithBalance.collectAsState()

    val items = remember { mutableStateListOf(DraftItem(initialDesignation = "Article 1", initialQuantity = "1", initialUnitPrice = "100")) }
    var paidAmountStr by remember { mutableStateOf("0") }
    var notes by remember { mutableStateOf("") }

    val totalGeneral = items.sumOf { it.total }
    val montantPaye = paidAmountStr.toDoubleOrNull() ?: 0.0
    val resteAPayer = (totalGeneral - montantPaye).coerceAtLeast(0.0)

    val clientName = selectedClient?.name ?: "Sélectionner un client"

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Facture - $clientName", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.secondaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onSecondaryContainer
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
        ) {
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    Text("Lignes de produits", fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
                }

                itemsIndexed(items) { index, item ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Ligne \${index + 1}", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                if (items.size > 1) {
                                    IconButton(onClick = { items.removeAt(index) }) {
                                        Icon(Icons.Default.Delete, contentDescription = "Supprimer", tint = Color.Red)
                                    }
                                }
                            }
                            OutlinedTextField(
                                value = item.designation,
                                onValueChange = { item.designation = it },
                                label = { Text("Désignation du produit") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OutlinedTextField(
                                    value = item.quantityStr,
                                    onValueChange = { item.quantityStr = it },
                                    label = { Text("Quantité") },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                    modifier = Modifier.weight(1f),
                                    singleLine = true
                                )
                                OutlinedTextField(
                                    value = item.unitPriceStr,
                                    onValueChange = { item.unitPriceStr = it },
                                    label = { Text("Prix unitaire") },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                    modifier = Modifier.weight(1f),
                                    singleLine = true
                                )
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.End
                            ) {
                                Text(
                                    text = "Total ligne: %.2f €".format(item.total),
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }
                        }
                    }
                }

                item {
                    Button(
                        onClick = { items.add(DraftItem()) },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Ajouter un produit")
                    }
                }

                item {
                    OutlinedTextField(
                        value = paidAmountStr,
                        onValueChange = { paidAmountStr = it },
                        label = { Text("Montant payé (€)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }
            }

            // RÉSUMÉ FINANCIER EN BAS
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Total général:", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("%.2f €".format(totalGeneral), fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFF1E293B))
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Montant payé:", fontSize = 14.sp)
                        Text("%.2f €".format(montantPaye), fontSize = 14.sp, color = Color(0xFF059669), fontWeight = FontWeight.SemiBold)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Reste à payer:", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("%.2f €".format(resteAPayer), fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFFDC2626))
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = {
                            selectedClient?.let { client ->
                                val invoiceItems = items.map {
                                    InvoiceItem(
                                        designation = it.designation,
                                        quantity = it.quantity,
                                        unitPrice = it.unitPrice,
                                        total = it.total
                                    )
                                }
                                viewModel.saveInvoice(client, invoiceItems, montantPaye, notes) {
                                    onInvoiceSaved()
                                }
                            }
                        },
                        enabled = selectedClient != null && totalGeneral > 0,
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB))
                    ) {
                        Text("Enregistrer la facture", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/facturation/client/ui/screens/SituationScreen.kt',
    name: 'SituationScreen.kt',
    language: 'kotlin',
    description: 'Écran 3 Situation : Nombre de factures, total des ventes, payé, restant par client',
    content: `package com.facturation.client.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.facturation.client.data.local.ClientFinancialSummary
import com.facturation.client.ui.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SituationScreen(
    viewModel: MainViewModel,
    onSelectClientForHistory: (Long) -> Unit
) {
    val summaries by viewModel.financialSummaries.collectAsState()

    val totalVentes = summaries.sumOf { it.totalSales }
    val totalPaye = summaries.sumOf { it.totalPaid }
    val totalRestant = summaries.sumOf { it.totalRemaining }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Situation Financière", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF7C3AED),
                    titleContentColor = Color.White
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
        ) {
            // SYNTHÈSE GLOBALE
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF3E8FF))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Vue globale de l'entreprise", fontWeight = FontWeight.Bold, color = Color(0xFF6B21A8))
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Total des Ventes", fontSize = 12.sp, color = Color.Gray)
                            Text("%.2f €".format(totalVentes), fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFF1E293B))
                        }
                        Column {
                            Text("Total Encaissé", fontSize = 12.sp, color = Color.Gray)
                            Text("%.2f €".format(totalPaye), fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFF059669))
                        }
                        Column {
                            Text("Reste à Recouvrer", fontSize = 12.sp, color = Color.Gray)
                            Text("%.2f €".format(totalRestant), fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFFDC2626))
                        }
                    }
                }
            }

            Text(
                "Situation par client (cliquer pour l'historique)",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
            )

            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(summaries) { item ->
                    ClientSituationCard(item = item, onClick = { onSelectClientForHistory(item.clientId) })
                }
            }
        }
    }
}

@Composable
fun ClientSituationCard(item: ClientFinancialSummary, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(item.clientName, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text("\${item.invoiceCount} facture(s)", fontSize = 12.sp, color = Color.Gray)
            }
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Ventes", fontSize = 11.sp, color = Color.Gray)
                    Text("%.2f €".format(item.totalSales), fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                }
                Column {
                    Text("Payé", fontSize = 11.sp, color = Color.Gray)
                    Text("%.2f €".format(item.totalPaid), fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = Color(0xFF059669))
                }
                Column {
                    Text("Reste dû", fontSize = 11.sp, color = Color.Gray)
                    Text("%.2f €".format(item.totalRemaining), fontWeight = FontWeight.Bold, fontSize = 14.sp, color = if (item.totalRemaining > 0) Color(0xFFDC2626) else Color(0xFF16A34A))
                }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/facturation/client/ui/screens/ClientHistoryScreen.kt',
    name: 'ClientHistoryScreen.kt',
    language: 'kotlin',
    description: 'Historique des factures d\'un client : N° facture, date, total, payé, reste',
    content: `package com.facturation.client.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.facturation.client.data.model.Invoice
import com.facturation.client.ui.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClientHistoryScreen(
    clientId: Long,
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val invoicesFlow = remember(clientId) { viewModel.getInvoicesForClient(clientId) }
    val invoices by invoicesFlow.collectAsState(initial = emptyList())

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Historique des Factures", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Retour")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF1E293B),
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(16.dp)
        ) {
            if (invoices.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize()) {
                    Text("Aucune facture pour ce client.", color = Color.Gray)
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(invoices) { inv ->
                        InvoiceHistoryCard(invoice = inv)
                    }
                }
            }
        }
    }
}

@Composable
fun InvoiceHistoryCard(invoice: Invoice) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(invoice.invoiceNumber, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                Text(invoice.date, fontSize = 12.sp, color = Color.Gray)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Total", fontSize = 11.sp, color = Color.Gray)
                    Text("%.2f €".format(invoice.totalAmount), fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                }
                Column {
                    Text("Payé", fontSize = 11.sp, color = Color.Gray)
                    Text("%.2f €".format(invoice.paidAmount), fontWeight = FontWeight.SemiBold, fontSize = 14.sp, color = Color(0xFF059669))
                }
                Column {
                    Text("Reste", fontSize = 11.sp, color = Color.Gray)
                    Text(
                        "%.2f €".format(invoice.remainingAmount),
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = if (invoice.remainingAmount > 0) Color(0xFFDC2626) else Color(0xFF16A34A)
                    )
                }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/facturation/client/ui/theme/Color.kt',
    name: 'Color.kt',
    language: 'kotlin',
    description: 'Palette de couleurs Material 3 pour l\'application',
    content: `package com.facturation.client.ui.theme

import androidx.compose.ui.graphics.Color

val BluePrimary = Color(0xFF2563EB)
val BlueDark = Color(0xFF1E40AF)
val BlueLight = Color(0xFFDBEAFE)

val PurplePrimary = Color(0xFF7C3AED)
val PurpleDark = Color(0xFF5B21B6)
val PurpleLight = Color(0xFFEDE9FE)

val SlateDark = Color(0xFF1E293B)
val SlateBackground = Color(0xFFF8FAFC)

val GreenSuccess = Color(0xFF059669)
val RedAlert = Color(0xFFDC2626)
`,
  },
  {
    path: 'app/src/main/java/com/facturation/client/ui/theme/Type.kt',
    name: 'Type.kt',
    language: 'kotlin',
    description: 'Typographie Material 3 pour l\'application',
    content: `package com.facturation.client.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val Typography = Typography(
    bodyLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.5.sp
    ),
    titleLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 20.sp,
        lineHeight = 28.sp,
        letterSpacing = 0.sp
    )
)
`,
  },
  {
    path: 'app/src/main/java/com/facturation/client/ui/theme/Theme.kt',
    name: 'Theme.kt',
    language: 'kotlin',
    description: 'Thème Material 3 Jetpack Compose avec support clair/sombre',
    content: `package com.facturation.client.ui.theme

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
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    description: 'Manifeste Android avec déclaration de l\'activité principale et FileProvider',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.facturation.client">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Gestion Clients &amp; Facturation"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Facturation">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.Facturation">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="com.facturation.client.provider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/provider_paths" />
        </provider>
    </application>

</manifest>
`,
  },
  {
    path: 'app/src/main/res/xml/provider_paths.xml',
    name: 'provider_paths.xml',
    language: 'xml',
    description: 'Configuration des chemins sécurisés pour FileProvider (Partage PDF)',
    content: `<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <cache-path name="cache" path="." />
    <external-cache-path name="external_cache" path="." />
    <files-path name="files" path="." />
</paths>
`,
  },
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    language: 'groovy',
    description: 'Configuration Gradle du module Android avec Jetpack Compose et Room',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("kotlin-kapt")
}

android {
    namespace = "com.facturation.client"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.facturation.client"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // AndroidX & Lifecycle
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")

    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // Room Database SQLite locale (Sans Firebase, 100% Hors-Ligne)
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    kapt("androidx.room:room-compiler:$roomVersion")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
}
`,
  },
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts',
    language: 'groovy',
    description: 'Configuration Gradle du projet racine Android',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id("com.android.application") version "8.2.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.22" apply false
    id("org.jetbrains.kotlin.kapt") version "1.9.22" apply false
}
`,
  },
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    language: 'groovy',
    description: 'Paramètres du projet Android Studio avec dépôts Maven',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "Gestion Clients & Facturation"
include(":app")
`,
  },
  {
    path: 'app/src/main/java/com/facturation/client/util/PdfGenerator.kt',
    name: 'PdfGenerator.kt',
    language: 'kotlin',
    description: 'Générateur de documents PDF et partage natif sous Android',
    content: `package com.facturation.client.util

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import androidx.core.content.FileProvider
import com.facturation.client.data.model.Invoice
import com.facturation.client.data.model.InvoiceItem
import java.io.File
import java.io.FileOutputStream

object PdfGenerator {
    fun generateInvoicePdf(context: Context, invoice: Invoice, items: List<InvoiceItem>): File {
        val pdfDocument = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create()
        val page = pdfDocument.startPage(pageInfo)
        val canvas = page.canvas
        val paint = Paint()

        paint.color = Color.parseColor("#2563EB")
        canvas.drawRect(0f, 0f, 595f, 55f, paint)

        paint.color = Color.WHITE
        paint.textSize = 20f
        paint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        canvas.drawText("BON DE VENTE & FACTURE", 30f, 35f, paint)

        paint.color = Color.DKGRAY
        paint.textSize = 12f
        paint.typeface = Typeface.DEFAULT
        canvas.drawText("N° Facture : \${invoice.invoiceNumber}", 30f, 85f, paint)
        canvas.drawText("Date : \${invoice.date}", 30f, 105f, paint)

        paint.color = Color.BLACK
        paint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        canvas.drawText("Client : \${invoice.clientName}", 320f, 85f, paint)
        paint.typeface = Typeface.DEFAULT
        canvas.drawText("Tél : \${invoice.clientPhone}", 320f, 105f, paint)

        paint.color = Color.parseColor("#1E293B")
        canvas.drawRect(30f, 140f, 565f, 165f, paint)
        paint.color = Color.WHITE
        paint.textSize = 10f
        paint.typeface = Typeface.DEFAULT
        canvas.drawText("DÉSIGNATION", 40f, 157f, paint)
        canvas.drawText("QTÉ", 340f, 157f, paint)
        canvas.drawText("P.U. (€)", 410f, 157f, paint)
        canvas.drawText("TOTAL (€)", 500f, 157f, paint)

        var y = 185f
        paint.color = Color.BLACK
        paint.typeface = Typeface.DEFAULT
        items.forEach { item ->
            canvas.drawText(item.designation, 40f, y, paint)
            canvas.drawText(item.quantity.toString(), 340f, y, paint)
            canvas.drawText(String.format("%.2f", item.unitPrice), 410f, y, paint)
            canvas.drawText(String.format("%.2f", item.total), 500f, y, paint)
            y += 24f
        }

        y += 20f
        paint.color = Color.parseColor("#F1F5F9")
        canvas.drawRect(300f, y, 565f, y + 85f, paint)

        paint.color = Color.BLACK
        paint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        canvas.drawText("Total Général :", 315f, y + 25f, paint)
        canvas.drawText(String.format("%.2f €", invoice.totalAmount), 480f, y + 25f, paint)

        paint.color = Color.parseColor("#059669")
        canvas.drawText("Montant Payé :", 315f, y + 48f, paint)
        canvas.drawText(String.format("%.2f €", invoice.paidAmount), 480f, y + 48f, paint)

        paint.color = Color.parseColor("#DC2626")
        canvas.drawText("Reste à Payer :", 315f, y + 70f, paint)
        canvas.drawText(String.format("%.2f €", invoice.remainingAmount), 480f, y + 70f, paint)

        pdfDocument.finishPage(page)

        val file = File(context.cacheDir, "Facture_\${invoice.invoiceNumber}.pdf")
        val outputStream = FileOutputStream(file)
        pdfDocument.writeTo(outputStream)
        outputStream.close()
        pdfDocument.close()
        return file
    }

    fun sharePdf(context: Context, pdfFile: File) {
        val uri = FileProvider.getUriForFile(context, "\${context.packageName}.provider", pdfFile)
        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "application/pdf"
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        context.startActivity(Intent.createChooser(shareIntent, "Partager la facture"))
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/facturation/client/util/WhatsAppHelper.kt',
    name: 'WhatsAppHelper.kt',
    language: 'kotlin',
    description: 'Partage de la situation financière par WhatsApp sous Android',
    content: `package com.facturation.client.util

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
            intent.\`package\` = "com.whatsapp"
            context.startActivity(intent)
        } catch (e: Exception) {
            val fallbackIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            context.startActivity(fallbackIntent)
        }
    }
}
`,
  },
];

/**
 * Génère une archive ZIP complète prête à être ouverte directement dans Android Studio
 */
export async function generateAndroidZip(): Promise<Blob> {
  const zip = new JSZip();

  // Ajout de chaque fichier dans sa structure de dossiers exacte
  for (const file of ANDROID_FILES) {
    zip.file(file.path, file.content);
  }

  // Fichiers d'accompagnement Gradle standard
  zip.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8\nandroid.useAndroidX=true\nkotlin.code.style=official\nandroid.nonTransitiveRClass=true\n`
  );

  zip.file(
    'gradle/wrapper/gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME\ndistributionPath=wrapper/dists\ndistributionUrl=https\\://services.gradle.org/distributions/gradle-8.5-bin.zip\nzipStoreBase=GRADLE_USER_HOME\nzipStorePath=wrapper/dists\n`
  );

  zip.file(
    'app/proguard-rules.pro',
    `# Room SQLite ProGuard rules\n-keep class * extends androidx.room.RoomDatabase\n-dontwarn androidx.room.paging.**\n`
  );

  zip.file(
    'app/src/main/res/values/strings.xml',
    `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <string name="app_name">Gestion Clients &amp; Facturation</string>\n</resources>\n`
  );

  zip.file(
    'app/src/main/res/values-ar/strings.xml',
    `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <string name="app_name">إدارة العملاء والفواتير</string>\n    <string name="clients_title">العملاء</string>\n    <string name="invoices_title">الفواتير</string>\n    <string name="situation_title">الوضعية المالية</string>\n    <string name="new_client">عميل جديد</string>\n    <string name="save_invoice">حفظ الفاتورة</string>\n    <string name="share_whatsapp">مشاركة عبر واتساب</string>\n</resources>\n`
  );

  zip.file(
    'app/src/main/res/values/styles.xml',
    `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <style name="Theme.Facturation" parent="android:Theme.Material.Light.NoActionBar">\n        <item name="android:statusBarColor">#2563EB</item>\n    </style>\n</resources>\n`
  );

  zip.file(
    'README_ANDROID.md',
    `# Gestion Clients & Facturation - Projet Android Natif Kotlin + Jetpack Compose

Ce projet est une application Android native complète développée en **Kotlin** et **Jetpack Compose**.

## Fonctionnalités incluses :
- **100% Hors-ligne** : Utilise SQLite via la bibliothèque officielle **Android Room**.
- **Sans Firebase ni dépendance externe superflue**.
- **Écran 1 - Clients** : Cartes clients, coordonnées, solde restant, formulaire d'ajout.
- **Écran 2 - Facture / Bon de Vente** : Multi-lignes, calcul automatique de quantité x prix, calcul du total, montant payé et reste à payer.
- **Écran 3 - Situation** : Synthèse globale du chiffre d'affaires, total payé, reste à recouvrer et historique détaillé par client.

## Comment compiler et installer sur votre téléphone :
1. Décompressez cette archive dans un dossier sur votre ordinateur.
2. Ouvrez **Android Studio** (Hedgehog ou plus récent).
3. Choisissez **Open** et sélectionnez le dossier racine décompressé.
4. Laissez Gradle synchroniser le projet (Sync Project with Gradle Files).
5. Connectez votre smartphone Android en USB (avec le débogage USB activé) ou lancez un émulateur.
6. Cliquez sur le bouton vert **Run (▶)** pour installer l'application sur votre smartphone !
`
  );

  return await zip.generateAsync({ type: 'blob' });
}
