const rx = require('./dist/rx')

it('should create a basic regex', () => {
  const regex = rx`abc`
  expect(regex).toBeInstanceOf(RegExp)
  expect(regex).toEqual(/abc/)
})

it('should escape control characters', () => {
  expect(rx`${'-/\\^$*+?.()|[]{}'}`).toEqual(/\-\/\\\^\$\*\+\?\.\(\)\|\[\]\{\}/)
})

it('should be able to use flags', () => {
  expect(rx('i')`foo`).toEqual(/foo/i)
})

it('should be able to use flags via proxied properties', () => {
  expect(rx.iu`foo`).toEqual(rx('iu')`foo`)
})

it('should not escape embedded regular expressions', () => {
  expect(rx`r${/./}x`).toEqual(/r.x/)
})

it('should not escape embedded rx literals', () => {
  expect(rx`r${rx.raw('.')}x`).toEqual(/r.x/)
  expect(rx`r${rx.raw`.`}x`).toEqual(/r.x/)
})

it('should use raw strings to create rx literals via rx.raw', () => {
  expect(rx`r${rx.raw`\.`}x`).toEqual(/r\.x/)
})

it('should join arrays with pipes', () => {
  expect(rx`${['r', '.', 'x']}`).toEqual(/r|\.|x/)
})

it('should not escape embedded regular expressions or rx literals in arrays', () => {
  expect(rx`${['r', /./, rx.raw`.`, 'x']}`).toEqual(/r|.|.|x/)
})

it('should flatten nested arrays', () => {
  expect(rx`${['r', ['x']]}`).toEqual(/r|x/)
})

it('should not double escape nested arrays', () => {
  expect(rx`${['r', ['x', /./]]}`).toEqual(/r|x|./)
})
