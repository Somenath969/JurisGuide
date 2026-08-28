import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, BookOpen, ChevronDown, Home, Users, Car,
  Shield, Gavel, Heart, FileText, ArrowLeft, Lightbulb,
} from 'lucide-react';
import Disclaimer from '@/components/Disclaimer';

interface Topic {
  id: string;
  category: string;
  icon: typeof Home;
  color: string;
  bgColor: string;
  title: string;
  description: string;
  explanation: string;
  importantTerms: { term: string; definition: string }[];
  faqs: { q: string; a: string }[];
  relatedTopics: string[];
  documents: string[];
}

const TOPICS: Topic[] = [
  {
    id: 'property-buying',
    category: 'Property',
    icon: Home,
    color: 'text-navy-600 dark:text-navy-300',
    bgColor: 'bg-navy-50 dark:bg-navy-800',
    title: 'Buying Property',
    description: 'Understand the process and documents needed to buy property.',
    explanation: 'Buying property involves verifying the title, checking for encumbrances, preparing a sale deed, paying stamp duty, and registering the transfer. Always conduct due diligence on the property and seller before making any payment.',
    importantTerms: [
      { term: 'Title Deed', definition: 'A legal document proving ownership of the property.' },
      { term: 'Encumbrance Certificate', definition: 'A certificate showing whether the property has any pending loans or legal disputes.' },
      { term: 'Sale Deed', definition: 'The legal document that transfers ownership from seller to buyer.' },
      { term: 'Stamp Duty', definition: 'A tax paid to the government on property transactions, typically 5-8% of the property value.' },
    ],
    faqs: [
      { q: 'What documents should I check before buying?', a: 'Verify the title deed, encumbrance certificate, property tax receipts, approved building plans, and the seller\'s identity documents.' },
      { q: 'Is registration mandatory?', a: 'Yes, the sale deed must be registered with the local sub-registrar\'s office for the transfer to be legally valid.' },
      { q: 'What is occupancy certificate?', a: 'It is a document issued by the local authority confirming that the building is fit for occupation and was constructed as per approved plans.' },
    ],
    relatedTopics: ['property-selling', 'rental-agreements', 'property-documents'],
    documents: ['Title Deed', 'Encumbrance Certificate', 'Sale Deed', 'Property Tax Receipts', 'Building Approval Plan'],
  },
  {
    id: 'property-selling',
    category: 'Property',
    icon: Home,
    color: 'text-navy-600 dark:text-navy-300',
    bgColor: 'bg-navy-50 dark:bg-navy-800',
    title: 'Selling Property',
    description: 'Key steps and documents when selling your property.',
    explanation: 'Selling property requires clear title, no outstanding loans, and proper documentation. You need to prepare a sale agreement, obtain necessary clearances, and register the sale deed with the buyer.',
    importantTerms: [
      { term: 'Agreement to Sell', definition: 'A preliminary agreement outlining the terms of sale before the final sale deed.' },
      { term: 'No Objection Certificate (NOC)', definition: 'A certificate from the society or authority confirming no objections to the sale.' },
      { term: 'Capital Gains Tax', definition: 'Tax on the profit earned from selling the property, calculated on the difference between sale and purchase price.' },
    ],
    faqs: [
      { q: 'Do I need to pay tax when selling?', a: 'Yes, capital gains tax applies. Short-term gains (property held under 2 years) are taxed at your income tax rate; long-term gains (over 2 years) at 20% with indexation.' },
      { q: 'Can I sell property with an ongoing loan?', a: 'Yes, but the loan must be cleared first, or the buyer can take over the loan with the bank\'s approval.' },
    ],
    relatedTopics: ['property-buying', 'property-documents'],
    documents: ['Title Deed', 'NOC from Society', 'Property Tax Receipts', 'Encumbrance Certificate'],
  },
  {
    id: 'rental-agreements',
    category: 'Property',
    icon: Home,
    color: 'text-navy-600 dark:text-navy-300',
    bgColor: 'bg-navy-50 dark:bg-navy-800',
    title: 'Rental Agreements',
    description: 'Understand your rights as a tenant or landlord.',
    explanation: 'A rental agreement is a legal contract between a landlord and tenant. It should specify rent, deposit, duration, maintenance responsibilities, and termination conditions. Always register the agreement if the term exceeds 11 months.',
    importantTerms: [
      { term: 'Security Deposit', definition: 'A refundable amount paid by the tenant to the landlord as security against damages or unpaid rent.' },
      { term: 'Lock-in Period', definition: 'A period during which neither party can terminate the agreement without penalty.' },
      { term: 'Notice Period', definition: 'The advance notice required (usually 1-2 months) before terminating the rental agreement.' },
    ],
    faqs: [
      { q: 'Is a verbal rental agreement valid?', a: 'While verbal agreements can be legally binding, written agreements are strongly recommended as they are easier to enforce and prove.' },
      { q: 'How much security deposit can a landlord charge?', a: 'This varies by state. Many states cap the deposit at 2-6 months of rent. Check your local rent control laws.' },
      { q: 'Can the landlord increase rent anytime?', a: 'No, rent increases must follow the terms in the agreement. Typically, rent can be increased by 5-10% annually or as agreed.' },
    ],
    relatedTopics: ['property-buying', 'property-documents'],
    documents: ['Rental Agreement', 'Identity Proof', 'Address Proof of Landlord'],
  },
  {
    id: 'property-documents',
    category: 'Property',
    icon: FileText,
    color: 'text-navy-600 dark:text-navy-300',
    bgColor: 'bg-navy-50 dark:bg-navy-800',
    title: 'Property Documents',
    description: 'Essential documents every property owner should have.',
    explanation: 'Maintaining proper property documents is crucial for proving ownership, resolving disputes, and selling the property. Key documents include the title deed, tax receipts, building approvals, and encumbrance certificates.',
    importantTerms: [
      { term: 'Khata Certificate', definition: 'A document showing the property is recorded in the local municipal records.' },
      { term: 'Possession Certificate', definition: 'A document confirming transfer of possession from builder/seller to the buyer.' },
      { term: 'Mutation Entry', definition: 'The updating of revenue records to reflect the new owner\'s name after a property transfer.' },
    ],
    faqs: [
      { q: 'What if I lost my original sale deed?', a: 'You can obtain a certified copy from the sub-registrar\'s office where the deed was registered. File an FIR about the lost document first.' },
      { q: 'How do I check if a property has legal disputes?', a: 'Check the encumbrance certificate, search court records, and verify with the local municipal office for any pending litigation.' },
    ],
    relatedTopics: ['property-buying', 'property-selling', 'rental-agreements'],
    documents: ['Title Deed', 'Encumbrance Certificate', 'Property Tax Receipts', 'Khata Certificate', 'Building Plan Approval'],
  },
  {
    id: 'marriage-documentation',
    category: 'Marriage & Family',
    icon: Heart,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    title: 'Marriage Documentation',
    description: 'How to register your marriage and get the right documents.',
    explanation: 'Marriage registration provides legal recognition to your marriage. You can register under the Hindu Marriage Act or the Special Marriage Act depending on your religion and circumstances. A marriage certificate is essential for visas, insurance, joint property, and name changes.',
    importantTerms: [
      { term: 'Marriage Certificate', definition: 'An official document issued by the government proving that a marriage has been legally registered.' },
      { term: 'Special Marriage Act', definition: 'A law that allows marriage between people of different religions or castes through civil registration.' },
      { term: 'Hindu Marriage Act', definition: 'A law governing marriage among Hindus, Buddhists, Jains, and Sikhs.' },
    ],
    faqs: [
      { q: 'Is marriage registration compulsory?', a: 'While not always compulsory at the time of marriage, registration is highly recommended and required for most legal and administrative purposes.' },
      { q: 'What documents are needed for marriage registration?', a: 'Identity proof, address proof, date of birth proof, photographs, and witness declarations are typically required.' },
      { q: 'How long does registration take?', a: 'Under the Hindu Marriage Act, it can take 7-30 days. Under the Special Marriage Act, a 30-day notice period is required.' },
    ],
    relatedTopics: ['divorce-information', 'child-custody'],
    documents: ['Marriage Certificate', 'Identity Proof of Both Parties', 'Address Proof', 'Wedding Photos', 'Witness Affidavits'],
  },
  {
    id: 'divorce-information',
    category: 'Marriage & Family',
    icon: Users,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    title: 'Divorce Information',
    description: 'Understanding the divorce process and your options.',
    explanation: 'Divorce can be filed as mutual consent (both parties agree) or contested (one party files against the other). Mutual consent divorce is faster and less adversarial. Grounds for divorce include cruelty, desertion, adultery, and irretrievable breakdown of marriage.',
    importantTerms: [
      { term: 'Mutual Consent Divorce', definition: 'A divorce where both spouses agree to end the marriage. Requires a minimum separation period (usually 1 year).' },
      { term: 'Contested Divorce', definition: 'A divorce where one spouse files against the other based on specific legal grounds. Takes longer and is more complex.' },
      { term: 'Alimony / Maintenance', definition: 'Financial support paid by one spouse to the other after divorce, based on income and standard of living.' },
    ],
    faqs: [
      { q: 'How long does a mutual consent divorce take?', a: 'Typically 6-18 months, including a mandatory 6-month cooling-off period that courts may sometimes waive.' },
      { q: 'Can I get divorce without going to court?', a: 'No, all divorces in India require a court decree. However, mutual consent divorces involve minimal court appearances.' },
      { q: 'What is the cooling-off period?', a: 'A 6-month period after filing the first motion, designed to give couples time to reconsider. Courts can waive this in certain cases.' },
    ],
    relatedTopics: ['marriage-documentation', 'child-custody'],
    documents: ['Marriage Certificate', 'Identity Proof', 'Address Proof', 'Income Proof', 'Asset Documentation'],
  },
  {
    id: 'child-custody',
    category: 'Marriage & Family',
    icon: Users,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    title: 'Child Custody',
    description: 'Understanding custody rights and the best interests of the child.',
    explanation: 'Child custody decisions are based on the "best interests of the child" principle. Courts consider the child\'s age, emotional bonds, parent\'s financial stability, and the child\'s own preference (if old enough). Both physical custody (where the child lives) and legal custody (decision-making authority) are considered.',
    importantTerms: [
      { term: 'Physical Custody', definition: 'The right of a parent to have the child live with them.' },
      { term: 'Legal Custody', definition: 'The right to make important decisions about the child\'s upbringing, education, and healthcare.' },
      { term: 'Visitation Rights', definition: 'The non-custodial parent\'s right to spend time with the child on a scheduled basis.' },
    ],
    faqs: [
      { q: 'Does the mother always get custody?', a: 'No. While courts often favor mothers for young children, the primary consideration is the child\'s welfare. Fathers can and do get custody.' },
      { q: 'At what age can a child choose which parent to live with?', a: 'Courts may consider the child\'s preference from around age 9-12, but it is not the sole deciding factor.' },
      { q: 'Can custody arrangements be changed later?', a: 'Yes, custody orders can be modified if there is a significant change in circumstances affecting the child\'s welfare.' },
    ],
    relatedTopics: ['divorce-information', 'marriage-documentation'],
    documents: ['Birth Certificate of Child', 'Income Proof', 'School Records', 'Character Witnesses'],
  },
  {
    id: 'traffic-violations',
    category: 'Traffic Laws',
    icon: Car,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    title: 'Traffic Violations',
    description: 'Common traffic violations and their penalties.',
    explanation: 'Traffic violations include speeding, not wearing a helmet or seatbelt, drunk driving, using a phone while driving, and driving without a valid license. Penalties range from fines to imprisonment for serious offenses. The Motor Vehicles Act specifies the penalties for each violation.',
    importantTerms: [
      { term: 'Challan', definition: 'A traffic ticket or fine notice issued by traffic police for a violation.' },
      { term: 'Drunken Driving', definition: 'Driving with blood alcohol above the legal limit (30 mg per 100 ml in India). A serious offense.' },
      { term: 'Suspension of License', definition: 'Temporary or permanent revocation of driving privileges for serious or repeated violations.' },
    ],
    faqs: [
      { q: 'How do I pay a traffic challan?', a: 'You can pay online through your state\'s transport department website, the mParivahan app, or at the nearest traffic police station.' },
      { q: 'What happens if I don\'t pay a challan?', a: 'Unpaid challans can lead to court summons, license suspension, or additional penalties. It is best to pay promptly.' },
      { q: 'Can I contest a traffic challan?', a: 'Yes, you can contest a challan in court. You will need to appear on the specified date and present your case.' },
    ],
    relatedTopics: ['traffic-procedures', 'court-proceedings'],
    documents: ['Driving License', 'Vehicle Registration (RC)', 'Insurance Certificate', 'Pollution Under Control (PUC) Certificate'],
  },
  {
    id: 'traffic-procedures',
    category: 'Traffic Laws',
    icon: Car,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    title: 'Traffic Procedures',
    description: 'What to do during a traffic stop or accident.',
    explanation: 'During a traffic stop, cooperate with the police, show your documents, and pay the fine if applicable. In case of an accident, stop your vehicle, help the injured, call emergency services, file an FIR, and inform your insurance company within 48 hours.',
    importantTerms: [
      { term: 'FIR (First Information Report)', definition: 'A written document prepared by police when they receive information about a cognizable offense.' },
      { term: 'Hit and Run', definition: 'Leaving the scene of an accident without stopping and providing assistance — a serious criminal offense.' },
      { term: 'Insurance Claim', definition: 'A formal request to your insurance company for compensation for damages or injuries.' },
    ],
    faqs: [
      { q: 'What should I carry while driving?', a: 'Always carry your driving license, vehicle registration certificate (RC), insurance certificate, and PUC certificate.' },
      { q: 'What to do after an accident?', a: 'Stop, check for injuries, call 112 for emergency help, inform police and file an FIR, take photos, and notify your insurance company within 48 hours.' },
    ],
    relatedTopics: ['traffic-violations', 'court-proceedings'],
    documents: ['Driving License', 'RC Book', 'Insurance Certificate', 'FIR Copy (if accident)'],
  },
  {
    id: 'human-rights',
    category: 'Human Rights',
    icon: Shield,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    title: 'Human Rights',
    description: 'Your fundamental human rights and protections.',
    explanation: 'Human rights are basic rights and freedoms that belong to every person. They include the right to life, liberty, equality, freedom from discrimination, freedom of speech, and the right to education and health. These are protected by the Constitution and international treaties.',
    importantTerms: [
      { term: 'Right to Equality', definition: 'The principle that all persons are equal before the law and entitled to equal protection.' },
      { term: 'Right to Life', definition: 'No person shall be deprived of life or personal liberty except according to procedure established by law.' },
      { term: 'Right to Freedom of Speech', definition: 'The right to express opinions freely, subject to reasonable restrictions.' },
    ],
    faqs: [
      { q: 'What can I do if my rights are violated?', a: 'You can file a writ petition in the High Court (Article 226) or Supreme Court (Article 32), or approach the Human Rights Commission.' },
      { q: 'What is the Right to Information?', a: 'A law that allows citizens to request information from public authorities, promoting transparency and accountability.' },
    ],
    relatedTopics: ['fundamental-duties', 'court-proceedings'],
    documents: ['Identity Proof', 'Evidence of Violation', 'Witness Statements'],
  },
  {
    id: 'fundamental-duties',
    category: 'Fundamental Duties',
    icon: Shield,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    title: 'Fundamental Duties',
    description: 'Your duties as a citizen alongside your rights.',
    explanation: 'The Constitution outlines fundamental duties for every citizen, including respecting the national flag and anthem, promoting harmony, protecting public property, protecting the environment, and developing scientific temper. These duties complement your fundamental rights.',
    importantTerms: [
      { term: 'Constitutional Duty', definition: 'A legal or moral obligation imposed by the Constitution on citizens.' },
      { term: 'Civic Responsibility', definition: 'The active participation of citizens in their community and governance.' },
    ],
    faqs: [
      { q: 'Are fundamental duties legally enforceable?', a: 'Unlike fundamental rights, duties are not directly enforceable by courts, but they guide laws and public policy.' },
      { q: 'How many fundamental duties are there?', a: 'There are 11 fundamental duties listed in Article 51A of the Constitution.' },
    ],
    relatedTopics: ['human-rights'],
    documents: [],
  },
  {
    id: 'court-proceedings',
    category: 'Court Proceedings',
    icon: Gavel,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    title: 'Court Proceedings',
    description: 'How courts work and what to expect.',
    explanation: 'Court proceedings begin with filing a case, followed by hearings, evidence presentation, arguments, and a judgment. The hierarchy includes district courts, high courts, and the Supreme Court. Civil cases involve disputes between parties, while criminal cases involve offenses against the state.',
    importantTerms: [
      { term: 'Plaintiff', definition: 'The party who files a lawsuit in a civil case.' },
      { term: 'Defendant', definition: 'The party against whom a lawsuit is filed.' },
      { term: 'Bail', definition: 'A temporary release of an accused person awaiting trial, with conditions and sometimes a financial guarantee.' },
      { term: 'Adjournment', definition: 'The postponement of a court hearing to a later date.' },
    ],
    faqs: [
      { q: 'Do I need a lawyer to go to court?', a: 'You can represent yourself as a "party in person," but having a lawyer is strongly recommended, especially for complex cases.' },
      { q: 'What is the difference between civil and criminal cases?', a: 'Civil cases involve disputes between individuals or entities (property, contracts). Criminal cases involve offenses against society (theft, assault) and are prosecuted by the state.' },
      { q: 'How long does a court case take?', a: 'It varies widely — from months to years depending on complexity, court backlog, and the type of case.' },
    ],
    relatedTopics: ['human-rights', 'traffic-procedures'],
    documents: ['Court Summons', 'FIR Copy (criminal)', 'Identity Proof', 'Evidence Documents', 'Witness List'],
  },
];

const CATEGORIES = ['All', 'Property', 'Marriage & Family', 'Traffic Laws', 'Human Rights', 'Fundamental Duties', 'Court Proceedings'];

export default function LegalTopicsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const filtered = TOPICS.filter((topic) => {
    const matchesSearch =
      topic.title.toLowerCase().includes(search.toLowerCase()) ||
      topic.description.toLowerCase().includes(search.toLowerCase()) ||
      topic.explanation.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || topic.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Legal Topics</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Browse simplified guides on different areas of law</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-11"
          placeholder="Search legal topics..."
        />
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-navy-700 text-white dark:bg-navy-600'
                : 'bg-white dark:bg-navy-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800 border border-gray-200 dark:border-navy-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Topics */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No topics found matching your search.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {filtered.map((topic, i) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card overflow-hidden"
            >
              <button
                onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                className="w-full text-left p-5"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl ${topic.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <topic.icon className={`w-5 h-5 ${topic.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-navy-900 dark:text-white">{topic.title}</h3>
                      <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expandedTopic === topic.id ? 'rotate-180' : ''}`} />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{topic.description}</p>
                    <span className="inline-block mt-2 text-xs text-navy-500 dark:text-navy-300 font-medium">{topic.category}</span>
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {expandedTopic === topic.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-4 border-t border-gray-100 dark:border-navy-800 pt-4">
                      {/* Explanation */}
                      <div>
                        <h4 className="text-xs font-semibold text-navy-600 dark:text-gold-400 uppercase tracking-wide mb-1.5">Simple Explanation</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{topic.explanation}</p>
                      </div>

                      {/* Important terms */}
                      {topic.importantTerms.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-navy-600 dark:text-gold-400 uppercase tracking-wide mb-2">Important Terms</h4>
                          <div className="space-y-2">
                            {topic.importantTerms.map((t) => (
                              <div key={t.term} className="p-2.5 rounded-lg bg-gray-50 dark:bg-navy-800/50 border border-gray-100 dark:border-navy-700/50">
                                <p className="text-sm font-medium text-navy-800 dark:text-white">{t.term}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{t.definition}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* FAQs */}
                      {topic.faqs.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-navy-600 dark:text-gold-400 uppercase tracking-wide mb-2">Frequently Asked Questions</h4>
                          <div className="space-y-2">
                            {topic.faqs.map((faq, j) => (
                              <div key={j} className="p-2.5 rounded-lg bg-gray-50 dark:bg-navy-800/50 border border-gray-100 dark:border-navy-700/50">
                                <p className="text-sm font-medium text-navy-800 dark:text-white">Q: {faq.q}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">A: {faq.a}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Documents */}
                      {topic.documents.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-navy-600 dark:text-gold-400 uppercase tracking-wide mb-2">Relevant Documents</h4>
                          <div className="flex flex-wrap gap-2">
                            {topic.documents.map((doc) => (
                              <span key={doc} className="px-2.5 py-1 rounded-lg bg-navy-50 dark:bg-navy-800 text-xs font-medium text-navy-700 dark:text-navy-300">
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Related topics */}
                      {topic.relatedTopics.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-navy-600 dark:text-gold-400 uppercase tracking-wide mb-2">Related Topics</h4>
                          <div className="flex flex-wrap gap-2">
                            {topic.relatedTopics.map((relId) => {
                              const rel = TOPICS.find((t) => t.id === relId);
                              return rel ? (
                                <button
                                  key={relId}
                                  onClick={() => setExpandedTopic(relId)}
                                  className="px-2.5 py-1 rounded-lg bg-gold-50 dark:bg-gold-900/30 text-xs font-medium text-gold-700 dark:text-gold-400 hover:bg-gold-100 dark:hover:bg-gold-900/50 transition-colors"
                                >
                                  {rel.title}
                                </button>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gold-50 dark:bg-navy-900/50 border border-gold-200 dark:border-navy-700 rounded-lg p-3">
                        <Lightbulb className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                        <p>This is general legal information, not professional legal advice. For your specific situation, please consult a qualified lawyer.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      <Disclaimer compact />
    </div>
  );
}
