f = open(r'c:\Users\user\volga-remodel-15-6-26\client\volga.js', encoding='utf-8')
lines = f.readlines()
f.close()

# All indices are 0-based
# 1. Remove allCaseStudies line (0-idx 673) and allIndustryNews line (0-idx 675)
#    lines 673 = "let allCaseStudies = [];\n"
#    lines 675 = "let allIndustryNews = [];\n"
# 2. Remove fetchCaseStudies + renderCaseStudies + skeletons block: 0-idx 1045–1184 inclusive
# 3. Remove renderIndustryNewsSkeletons + fetchIndustryNews + renderIndustryNews: 0-idx 1185–1284 inclusive
# 4. Remove fetchInsightsOverview + renderInsightsOverview + updateInsightsOverviewSidebar: 0-idx 1285–1454 inclusive
# 5. Remove init calls: 0-idx 1794 (fetchCaseStudies), 1796 (fetchIndustryNews), 1797 (fetchInsightsOverview)

# Build set of lines to delete (0-indexed)
to_delete = set()

# vars (lines 673 and 675 are 0-indexed)
to_delete.add(673)
to_delete.add(675)

# Block 1: fetchCaseStudies..end of render block (0-idx 1045 to 1184)
for i in range(1045, 1185):
    to_delete.add(i)

# Block 2: renderIndustryNewsSkeletons..end of renderIndustryNews (0-idx 1185 to 1284)
for i in range(1185, 1285):
    to_delete.add(i)

# Block 3: fetchInsightsOverview..end of updateInsightsOverviewSidebar (0-idx 1285 to 1454)
for i in range(1285, 1455):
    to_delete.add(i)

# Init calls (0-indexed)
# fetchCaseStudies call is at line 1794 (1-based) = 0-idx 1793
# fetchIndustryNews call is at line 1797 (1-based) = 0-idx 1796
# fetchInsightsOverview call is at line 1798 (1-based) = 0-idx 1797
to_delete.add(1793)
to_delete.add(1796)
to_delete.add(1797)

out = [line for i, line in enumerate(lines) if i not in to_delete]

f = open(r'c:\Users\user\volga-remodel-15-6-26\client\volga.js', 'w', encoding='utf-8')
f.writelines(out)
f.close()
print(f'Done. Lines before: {len(lines)}, after: {len(out)}, removed: {len(lines)-len(out)}')
