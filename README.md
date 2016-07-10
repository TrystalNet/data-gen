# Trist 

[Site](https://trystal.net/) |
[Docs](https://trystal.net/) |
[Wiki](https://github.com/trystal/trist/wiki "Changelog, Roadmap, etc.") |
[Code of Conduct](https://jquery.org/conduct/) |
[Twitter](https://twitter.com/trystalnet) |
[Chat](https://gitter.im/trystal/trystal)

## Data-Gen

### Generating test trists....

Generates test data for Trystal and associated applications testing, primarily (ok, 'only' for now) trist data.

The key is that simple strings can be used to develop complex trist structures.

This: ```buildChain('A.B..C')``` builds a trist chain that models a trist that looks like this:
```
<] NodeA
<]   NodeB
 ]     NodeC   
```
where ABC are ids of nodes, and A has a level of 0, B has a level of 1, C has a level of 2 etc.
Each ```.``` in the spec represents a level of indentation.

Parentheses are used to show hidden nodes thus:

```buildChain('A(.B)C)``` builds a chain that looks like this:
```
>] NodeA
 ]   (NodeB (hidden))
 ] NodeC   
```

Note that this does NOT attempt to build all possibities of complex trist structures, just 
enough to a large percentage of the vast majority of tests that we do with Trystal structures.

### Naming nodes....

In order to keep the trist specs simple, the ids must be in one simple format.
For those familiar with regex, the matching pattern is ```/[A-Z][0-9]*/ig```  
For everyone else, this matches one letter and zero or more digits so 
```
   A, B, W0, Q99 
```
are valid ids in the trist spec, but 
```
  AA, @A, _l are not
```
It is highly recommended to *only* use single letters A, B, C, W, X, Y when generating trists, 
in order to keep the specs easy to visualize and reason about for human beings.

The additional digits are allowed in order to support dumping trists that have nodes that 
have been generated programattically with in a trist, such as by pasting in some text that 
becomes multiple lines. The trist code can assign these new lines ids of X1, X2, etc., and 
we wanted to be able to dump those out to easily check that the trist was valid.

Which brings us to...   

## Dumping trists....

The corollary function is dump, takes a trist and turns it back into a spec so that it can 
easily be checked for validity, and to make it easy to develop checks on test results. So 
for example, a test might construct and use a chain thus:
```
   chain = buildChain("AB") 
```
The application code would then insert a node between A and B, perhaps with an id of 'X0' and 
at an indentation level of 3. We would then test for:
```
   dump(chain) === 'A...X0B'
```
where the ...X0 is the added node at level 3.

### Levels

*This technical note is only interesting if you care about the internals of trysts* 

Note that trysts internally specify levels *relatively* meaning relative to the node that comes
before. The Specs do NOT operate this way. They are always specified as absolute levels, even 
if the node is hidden. So that means this:
```
   A.B..C 
```
Specifies A at level 0, B at level 1, and C at level 2, even though internally this would be 
represented as B at rlevel +1 (relative to A) and C at rlevel +1 (relative to B)

### Payloads

This code is concerned with the abstract manipulations of tryst structures and not payloads, 
so in the test data payloads are represent as simple objects with just the single property (id)
that is needed to make the node valid. 

Other test modules will be made available for manipulating payload contents (see the @trystal/trystup)
application.



