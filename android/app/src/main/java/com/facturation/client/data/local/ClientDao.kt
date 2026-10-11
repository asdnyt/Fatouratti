package com.facturation.client.data.local

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
