import React, { useState } from 'react';
import { FileCode2, Copy, Check, Terminal, Layers, Box, Cpu, Database, Server } from 'lucide-react';

interface KotlinFile {
  name: string;
  path: string;
  category: 'core' | 'model' | 'repository' | 'service' | 'api' | 'config' | 'test' | 'gradle';
  code: string;
  description: string;
}

const KOTLIN_FILES: KotlinFile[] = [
  {
    name: 'BackendApplication.kt',
    path: 'src/main/kotlin/com/smartReward/backend/BackendApplication.kt',
    category: 'core',
    description: 'Spring Boot 3.3 entry point application',
    code: `package com.smartReward.backend

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class BackendApplication

fun main(args: Array<String>) {
    runApplication<BackendApplication>(*args)
}`
  },
  {
    name: 'RuleEngine.kt',
    path: 'src/main/kotlin/com/smartReward/backend/ruleengine/RuleEngine.kt',
    category: 'service',
    description: 'Prioritized rule evaluation and reward point calculator',
    code: `package com.smartReward.backend.ruleengine

import com.smartReward.backend.dto.EventRequest
import com.smartReward.backend.model.RewardRule
import com.smartReward.backend.model.RewardType
import org.springframework.stereotype.Component

@Component
class RuleEngine {

    /**
     * Evaluates a list of reward rules against an incoming event.
     * Returns total points earned.
     */
    fun evaluateRules(rules: List<RewardRule>, event: EventRequest): Double {
        return rules
            .filter { it.active }
            .filter { rule -> event.amount >= rule.minAmount }
            .sortedByDescending { it.priority }
            .sumOf { calculateReward(it, event) }
    }

    private fun calculateReward(rule: RewardRule, event: EventRequest): Double {
        return when (rule.rewardType) {
            RewardType.PERCENTAGE -> (event.amount * rule.rewardValue) / 100.0
            RewardType.FLAT -> rule.rewardValue
        }
    }
}`
  },
  {
    name: 'EventService.kt',
    path: 'src/main/kotlin/com/smartReward/backend/service/EventService.kt',
    category: 'service',
    description: 'Event orchestration, wallet credit, and transaction ledger recording',
    code: `package com.smartReward.backend.service

import com.smartReward.backend.dto.EventRequest
import com.smartReward.backend.dto.EventResponse
import com.smartReward.backend.model.Transaction
import com.smartReward.backend.model.TransactionStatus
import com.smartReward.backend.repository.RewardRuleRepository
import com.smartReward.backend.repository.TransactionRepository
import com.smartReward.backend.ruleengine.RuleEngine
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class EventService(
    private val rewardRuleRepository: RewardRuleRepository,
    private val ruleEngine: RuleEngine,
    private val walletService: WalletService,
    private val transactionRepository: TransactionRepository
) {

    @Transactional
    fun processEvent(event: EventRequest): EventResponse {
        val rules = rewardRuleRepository.findByBusinessIdAndEventTypeAndActiveTrue(
            businessId = event.businessId,
            eventType = event.eventType
        )

        val pointsAwarded = ruleEngine.evaluateRules(rules, event)

        if (pointsAwarded > 0) {
            val updatedWallet = walletService.creditPendingPoints(
                businessId = event.businessId,
                userId = event.userId,
                points = pointsAwarded
            )

            val tx = Transaction(
                businessId = event.businessId,
                userId = event.userId,
                eventType = event.eventType,
                pointsEarned = pointsAwarded,
                amount = event.amount,
                status = TransactionStatus.PENDING,
                referenceId = event.referenceId ?: "EVT-\${System.currentTimeMillis()}",
                timestamp = LocalDateTime.now()
            )
            val savedTx = transactionRepository.save(tx)

            return EventResponse(
                success = true,
                pointsAwarded = pointsAwarded,
                matchedRulesCount = rules.filter { event.amount >= it.minAmount }.size,
                transactionId = savedTx.id,
                message = "Event processed successfully. Awarded $pointsAwarded points.",
                pendingPoints = updatedWallet.pendingPoints,
                availablePoints = updatedWallet.availablePoints
            )
        }

        val wallet = walletService.getWallet(event.businessId, event.userId)
        return EventResponse(
            success = true,
            pointsAwarded = 0.0,
            matchedRulesCount = 0,
            transactionId = null,
            message = "No matching rules met minimum criteria.",
            pendingPoints = wallet.pendingPoints,
            availablePoints = wallet.availablePoints
        )
    }
}`
  },
  {
    name: 'WalletService.kt',
    path: 'src/main/kotlin/com/smartReward/backend/service/WalletService.kt',
    category: 'service',
    description: 'Wallet point lifecycle management (pending, confirm, redeem)',
    code: `package com.smartReward.backend.service

import com.smartReward.backend.dto.RedeemRequest
import com.smartReward.backend.dto.WalletResponse
import com.smartReward.backend.exception.InsufficientPointsException
import com.smartReward.backend.exception.ResourceNotFoundException
import com.smartReward.backend.model.Transaction
import com.smartReward.backend.model.TransactionStatus
import com.smartReward.backend.model.Wallet
import com.smartReward.backend.repository.TransactionRepository
import com.smartReward.backend.repository.WalletRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class WalletService(
    private val walletRepository: WalletRepository,
    private val transactionRepository: TransactionRepository
) {

    @Transactional(readOnly = true)
    fun getWallet(businessId: String, userId: String): WalletResponse {
        val wallet = walletRepository.findByBusinessIdAndUserId(businessId, userId)
            .orElseGet { Wallet(businessId = businessId, userId = userId) }

        val recentTransactions = transactionRepository
            .findByBusinessIdAndUserIdOrderByTimestampDesc(businessId, userId)

        return WalletResponse(
            businessId = wallet.businessId,
            userId = wallet.userId,
            availablePoints = wallet.availablePoints,
            pendingPoints = wallet.pendingPoints,
            recentTransactions = recentTransactions
        )
    }

    @Transactional
    fun creditPendingPoints(businessId: String, userId: String, points: Double): Wallet {
        val wallet = walletRepository.findByBusinessIdAndUserId(businessId, userId)
            .orElseGet { Wallet(businessId = businessId, userId = userId) }
        wallet.addPendingPoints(points)
        return walletRepository.save(wallet)
    }

    @Transactional
    fun confirmPendingPoints(businessId: String, userId: String, points: Double): Wallet {
        val wallet = walletRepository.findByBusinessIdAndUserId(businessId, userId)
            .orElseThrow { ResourceNotFoundException("Wallet not found") }

        wallet.confirmPendingPoints(points)
        return walletRepository.save(wallet)
    }

    @Transactional
    fun redeemPoints(request: RedeemRequest): WalletResponse {
        val wallet = walletRepository.findByBusinessIdAndUserId(request.businessId, request.userId)
            .orElseThrow { ResourceNotFoundException("Wallet not found") }

        if (!wallet.redeemPoints(request.points)) {
            throw InsufficientPointsException("Insufficient available points")
        }

        walletRepository.save(wallet)
        return getWallet(request.businessId, request.userId)
    }
}`
  },
  {
    name: 'EventController.kt',
    path: 'src/main/kotlin/com/smartReward/backend/api/EventController.kt',
    category: 'api',
    description: 'REST Controller for inbound event ingestion',
    code: `package com.smartReward.backend.api

import com.smartReward.backend.dto.EventRequest
import com.smartReward.backend.dto.EventResponse
import com.smartReward.backend.service.EventService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/events")
@CrossOrigin(origins = ["*"])
class EventController(
    private val eventService: EventService
) {

    @PostMapping
    fun postEvent(@Valid @RequestBody request: EventRequest): ResponseEntity<EventResponse> {
        val response = eventService.processEvent(request)
        return ResponseEntity.ok(response)
    }
}`
  },
  {
    name: 'WalletController.kt',
    path: 'src/main/kotlin/com/smartReward/backend/api/WalletController.kt',
    category: 'api',
    description: 'REST Controller for wallet queries, point confirmation, and redemptions',
    code: `package com.smartReward.backend.api

import com.smartReward.backend.dto.ConfirmPendingRequest
import com.smartReward.backend.dto.RedeemRequest
import com.smartReward.backend.dto.WalletResponse
import com.smartReward.backend.model.Wallet
import com.smartReward.backend.service.WalletService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/wallet")
@CrossOrigin(origins = ["*"])
class WalletController(
    private val walletService: WalletService
) {

    @GetMapping("/{businessId}/{userId}")
    fun getWallet(
        @PathVariable businessId: String,
        @PathVariable userId: String
    ): ResponseEntity<WalletResponse> {
        val wallet = walletService.getWallet(businessId, userId)
        return ResponseEntity.ok(wallet)
    }

    @PostMapping("/redeem")
    fun redeemPoints(@Valid @RequestBody request: RedeemRequest): ResponseEntity<WalletResponse> {
        val updatedWallet = walletService.redeemPoints(request)
        return ResponseEntity.ok(updatedWallet)
    }

    @PostMapping("/confirm")
    fun confirmPending(@Valid @RequestBody request: ConfirmPendingRequest): ResponseEntity<Wallet> {
        val updatedWallet = walletService.confirmPendingPoints(
            businessId = request.businessId,
            userId = request.userId,
            points = request.points
        )
        return ResponseEntity.ok(updatedWallet)
    }
}`
  },
  {
    name: 'RewardRule.kt',
    path: 'src/main/kotlin/com/smartReward/backend/model/RewardRule.kt',
    category: 'model',
    description: 'JPA entity representing reward configuration and calculation type',
    code: `package com.smartReward.backend.model

import jakarta.persistence.*
import java.time.LocalDateTime

enum class RewardType {
    PERCENTAGE,
    FLAT
}

@Entity
@Table(name = "reward_rules")
data class RewardRule(
    @Id
    val id: String,

    @Column(nullable = false)
    val businessId: String,

    @Column(nullable = false)
    val eventType: String,

    @Column(nullable = false)
    val minAmount: Double = 0.0,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val rewardType: RewardType,

    @Column(nullable = false)
    val rewardValue: Double,

    @Column(nullable = false)
    var active: Boolean = true,

    @Column(nullable = false)
    val priority: Int = 0,

    val createdAt: LocalDateTime = LocalDateTime.now()
)`
  },
  {
    name: 'Wallet.kt',
    path: 'src/main/kotlin/com/smartReward/backend/model/Wallet.kt',
    category: 'model',
    description: 'JPA entity maintaining pending and available balances per tenant',
    code: `package com.smartReward.backend.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "wallets",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["businessId", "userId"])
    ]
)
data class Wallet(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val businessId: String,

    @Column(nullable = false)
    val userId: String,

    @Column(nullable = false)
    var availablePoints: Double = 0.0,

    @Column(nullable = false)
    var pendingPoints: Double = 0.0,

    @Column(nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    fun addPendingPoints(points: Double) {
        this.pendingPoints += points
        this.updatedAt = LocalDateTime.now()
    }

    fun confirmPendingPoints(points: Double) {
        val pointsToConfirm = minOf(points, this.pendingPoints)
        this.pendingPoints -= pointsToConfirm
        this.availablePoints += pointsToConfirm
        this.updatedAt = LocalDateTime.now()
    }

    fun redeemPoints(points: Double): Boolean {
        if (this.availablePoints >= points) {
            this.availablePoints -= points
            this.updatedAt = LocalDateTime.now()
            return true
        }
        return false
    }
}`
  },
  {
    name: 'build.gradle.kts',
    path: 'backend/build.gradle.kts',
    category: 'gradle',
    description: 'Gradle Kotlin DSL dependencies and build configuration',
    code: `plugins {
    kotlin("jvm") version "1.9.25"
    kotlin("plugin.spring") version "1.9.25"
    kotlin("plugin.jpa") version "1.9.25"
    id("org.springframework.boot") version "3.3.4"
    id("io.spring.dependency-management") version "1.1.6"
}

group = "com.smartReward"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    
    runtimeOnly("com.h2database:h2")
    runtimeOnly("org.postgresql:postgresql")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
}`
  },
  {
    name: 'application.yml',
    path: 'src/main/resources/application.yml',
    category: 'config',
    description: 'Spring Boot datasource, JPA and H2 console settings',
    code: `server:
  port: 8080

spring:
  application:
    name: smart-reward-backend

  datasource:
    url: jdbc:h2:mem:rewarddb;DB_CLOSE_DELAY=-1
    driverClassName: org.h2.Driver
    username: sa
    password: 

  h2:
    console:
      enabled: true
      path: /h2-console

  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    hibernate:
      ddl-auto: update
    show-sql: true`
  }
];

export const KotlinSourceViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<KotlinFile>(KOTLIN_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredFiles = categoryFilter === 'all'
    ? KOTLIN_FILES
    : KOTLIN_FILES.filter(f => f.category === categoryFilter);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Cpu className="w-3.5 h-3.5" />
              Spring Boot 3.3 & Kotlin 1.9/2.0 Codebase
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Spring Boot & Kotlin Source Code
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              All Spring Boot & Kotlin source files, entities, repositories, and Gradle scripts are restored in <code className="text-indigo-300 bg-indigo-950/60 px-1.5 py-0.5 rounded text-xs font-mono">/backend</code> and ready for local development, Gradle builds, or GitHub/ZIP export.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>cd backend && ./gradlew bootRun</span>
            </div>
          </div>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* File Navigator */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Kotlin Project Structure
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {KOTLIN_FILES.length} Files
            </span>
          </div>

          {/* Filter Pills */}
          <div className="p-3 border-b border-slate-800/60 bg-slate-950/40 flex flex-wrap gap-1.5">
            {['all', 'core', 'service', 'api', 'model', 'config', 'gradle'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* File List */}
          <div className="divide-y divide-slate-800/40 max-h-[520px] overflow-y-auto">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3.5 transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-indigo-600/15 border-l-2 border-indigo-500 text-white'
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <FileCode2 className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate font-mono text-slate-200">
                      {file.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {file.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Display Area */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          {/* File Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-indigo-500/20 text-indigo-300 font-mono">
                  {selectedFile.category}
                </span>
                <h4 className="text-sm font-semibold text-white font-mono truncate">
                  {selectedFile.path}
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {selectedFile.description}
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer */}
          <div className="bg-slate-950 p-4 overflow-x-auto max-h-[540px]">
            <pre className="text-xs font-mono text-slate-200 leading-relaxed">
              <code>{selectedFile.code}</code>
            </pre>
          </div>

          {/* Quick Info Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/60 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              JPA / Hibernate Entity & Spring Service
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              Kotlin 1.9 / 2.0 • JVM 17
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
